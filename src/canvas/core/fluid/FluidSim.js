import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import advectFrag from './shaders/advect.frag.glsl';
import baseVert from './shaders/base.vert.glsl';
import clearFrag from './shaders/clear.frag.glsl';
import curlFrag from './shaders/curl.frag.glsl';
import divergenceFrag from './shaders/divergence.frag.glsl';
import gradientFrag from './shaders/gradient.frag.glsl';
import pressureFrag from './shaders/pressure.frag.glsl';
import splatFrag from './shaders/splat.frag.glsl';
import vorticityFrag from './shaders/vorticity.frag.glsl';

// Starting values from WebGL-Fluid-Simulation (Pavel Dobryakov, MIT); tune by eye.
const SIM_RESOLUTION = 128;
const VELOCITY_DISSIPATION = 0.97;
const PRESSURE_DISSIPATION = 0.8;
const CURL = 30;
const SPLAT_RADIUS = 0.0025;
const SPLAT_FORCE = 6000;
// Longest step per frame (s): 30 fps still runs in real time.
const MAX_STEP = 1 / 30;

// Half-float RGBA with linear filtering (RGBA and linear are the render-target defaults).
const createTarget = (width, height) => new THREE.WebGLRenderTarget(width, height, { type: THREE.HalfFloatType, depthBuffer: false });

// Ping-pong pair: a pass reads .read, writes .write, then swaps.
const createPingPong = (width, height) => ({
    read: createTarget(width, height),
    write: createTarget(width, height),
    swap() {
        [this.read, this.write] = [this.write, this.read];
    },
    setSize(width, height) {
        this.read.setSize(width, height);
        this.write.setSize(width, height);
    },
    dispose() {
        this.read.dispose();
        this.write.dispose();
    },
});

/** Screen-space stable-fluids velocity field (no dye), at SIM_RESOLUTION on the short screen side. */
export default class FluidSim {
    constructor(renderer, aspect, iterations) {
        this.renderer = renderer;
        this.iterations = iterations;
        this.lastPointer = null;
        this.quad = new FullScreenQuad();

        // Allocated at 1×1, sized by resize() below. One material per pass; drei's shaderMaterial exposes every uniform as a property.
        this.targets = {
            velocity: createPingPong(1, 1),
            pressure: createPingPong(1, 1),
            divergence: createTarget(1, 1),
            curl: createTarget(1, 1),
        };
        const pass = (fragmentShader, uniforms) => {
            const Pass = shaderMaterial({ texelSize: new THREE.Vector2(), ...uniforms }, baseVert, fragmentShader);
            return new Pass({ depthTest: false, depthWrite: false });
        };
        this.passes = {
            splat: pass(splatFrag, { uTarget: null, aspectRatio: 1, point: new THREE.Vector2(), color: new THREE.Vector3(), radius: 0 }),
            curl: pass(curlFrag, { uVelocity: null }),
            vorticity: pass(vorticityFrag, { uVelocity: null, uCurl: null, curl: CURL, dt: 0 }),
            divergence: pass(divergenceFrag, { uVelocity: null }),
            clear: pass(clearFrag, { uTexture: null, value: PRESSURE_DISSIPATION }),
            pressure: pass(pressureFrag, { uPressure: null, uDivergence: null }),
            gradient: pass(gradientFrag, { uPressure: null, uVelocity: null }),
            advect: pass(advectFrag, { uVelocity: null, uSource: null, dt: 0, dissipation: VELOCITY_DISSIPATION }),
        };
        this.resize(aspect);
    }

    /** Matches the screen aspect: SIM_RESOLUTION texels on the short side. Resets the field, keeps the compiled passes. */
    resize(aspect) {
        this.aspect = aspect;
        const width = Math.round(SIM_RESOLUTION * Math.max(aspect, 1));
        const height = Math.round(SIM_RESOLUTION / Math.min(aspect, 1));
        Object.values(this.targets).forEach((target) => target.setSize(width, height));
        Object.values(this.passes).forEach((pass) => pass.texelSize.set(1 / width, 1 / height));
        this.passes.splat.aspectRatio = aspect;
        this.passes.splat.radius = SPLAT_RADIUS * Math.max(aspect, 1);
    }

    /** Current velocity texture (xy in texels per second). */
    get velocity() {
        return this.targets.velocity.read.texture;
    }

    /** Renders one pass with the given uniforms into target; a ping-pong pair is written, then swapped. */
    run(pass, uniforms, target) {
        Object.assign(pass, uniforms);
        this.quad.material = pass;
        this.renderer.setRenderTarget(target.write ?? target);
        this.quad.render(this.renderer);
        target.swap?.();
    }

    /** Feeds pointer motion (R3F pointer, -1…1) into the field, then advances it by dt seconds. */
    update(pointer, dt) {
        const previous = this.renderer.getRenderTarget();
        // The fluid works in 0–1 UV space. The first frame only records the pointer.
        const last = (this.lastPointer ??= pointer.clone());
        const dx = (pointer.x - last.x) / 2;
        const dy = (pointer.y - last.y) / 2;
        last.copy(pointer);
        // ponytail: deltas over 0.1 UV in one frame are pointer jumps (re-entry, touch tap), not motion; raise if fast flicks get dropped.
        if ((dx !== 0 || dy !== 0) && Math.hypot(dx, dy) < 0.1) {
            this.splat((pointer.x + 1) / 2, (pointer.y + 1) / 2, dx, dy);
        }
        // Capped so a stalled tab doesn't blow the field up on its first frame back.
        this.step(Math.min(dt, MAX_STEP));
        this.renderer.setRenderTarget(previous);
    }

    /** Adds pointer motion at (x, y) in 0–1 UV space; dx, dy is the UV delta since the last frame. */
    splat(x, y, dx, dy) {
        const { splat } = this.passes;
        splat.point.set(x, y);
        // Equal force per screen pixel in x and y (velocity is in texels; a UV step is width texels in x, height in y).
        splat.color.set(dx * SPLAT_FORCE * Math.min(this.aspect, 1), (dy * SPLAT_FORCE) / Math.max(this.aspect, 1), 0);
        this.run(splat, { uTarget: this.velocity }, this.targets.velocity);
    }

    /** Advances the fluid by dt seconds: keep swirls, make the field divergence-free, then move it along itself. */
    step(dt) {
        const { velocity, pressure, divergence, curl } = this.targets;
        const { passes } = this;
        // Dissipation constants are per 60 Hz frame; scale them by the real step so the fade is frame-rate independent.
        const frames = dt * 60;

        this.run(passes.curl, { uVelocity: velocity.read.texture }, curl);
        this.run(passes.vorticity, { uVelocity: velocity.read.texture, uCurl: curl.texture, dt }, velocity);
        this.run(passes.divergence, { uVelocity: velocity.read.texture }, divergence);
        this.run(passes.clear, { uTexture: pressure.read.texture, value: PRESSURE_DISSIPATION ** frames }, pressure);
        for (let i = 0; i < this.iterations; i++) {
            this.run(passes.pressure, { uPressure: pressure.read.texture, uDivergence: divergence.texture }, pressure);
        }
        this.run(passes.gradient, { uPressure: pressure.read.texture, uVelocity: velocity.read.texture }, velocity);
        this.run(
            passes.advect,
            { uVelocity: velocity.read.texture, uSource: velocity.read.texture, dt, dissipation: VELOCITY_DISSIPATION ** frames },
            velocity
        );
    }

    dispose() {
        Object.values(this.targets).forEach((target) => target.dispose());
        Object.values(this.passes).forEach((pass) => pass.dispose());
        this.quad.dispose();
    }
}
