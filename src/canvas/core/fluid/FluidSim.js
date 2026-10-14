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

// Half-float RGBA with linear filtering (RGBA and linear are the render-target defaults).
const createTarget = (width, height) => new THREE.WebGLRenderTarget(width, height, { type: THREE.HalfFloatType, depthBuffer: false });

// Ping-pong pair: a pass reads .read, writes .write, then swaps.
const createPingPong = (width, height) => ({
    read: createTarget(width, height),
    write: createTarget(width, height),
    swap() {
        [this.read, this.write] = [this.write, this.read];
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
        this.aspect = aspect;
        this.iterations = iterations;

        const width = Math.round(SIM_RESOLUTION * Math.max(aspect, 1));
        const height = Math.round(SIM_RESOLUTION / Math.min(aspect, 1));
        this.targets = {
            velocity: createPingPong(width, height),
            pressure: createPingPong(width, height),
            divergence: createTarget(width, height),
            curl: createTarget(width, height),
        };
        this.quad = new FullScreenQuad();

        // One material per pass; drei's shaderMaterial exposes every uniform as a property (pass.dt = 0.016).
        const texelSize = new THREE.Vector2(1 / width, 1 / height);
        const pass = (fragmentShader, uniforms) => {
            const Pass = shaderMaterial({ texelSize, ...uniforms }, baseVert, fragmentShader);
            return new Pass({ depthTest: false, depthWrite: false });
        };
        this.passes = {
            splat: pass(splatFrag, {
                uTarget: null,
                aspectRatio: aspect,
                point: new THREE.Vector2(),
                color: new THREE.Vector3(),
                radius: SPLAT_RADIUS * Math.max(aspect, 1),
            }),
            curl: pass(curlFrag, { uVelocity: null }),
            vorticity: pass(vorticityFrag, { uVelocity: null, uCurl: null, curl: CURL, dt: 0 }),
            divergence: pass(divergenceFrag, { uVelocity: null }),
            clear: pass(clearFrag, { uTexture: null, value: PRESSURE_DISSIPATION }),
            pressure: pass(pressureFrag, { uPressure: null, uDivergence: null }),
            gradient: pass(gradientFrag, { uPressure: null, uVelocity: null }),
            advect: pass(advectFrag, { uVelocity: null, uSource: null, dt: 0, dissipation: VELOCITY_DISSIPATION }),
        };
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

    /** Adds pointer motion at (x, y) in 0–1 UV space; dx, dy is the UV delta since the last frame. */
    splat(x, y, dx, dy) {
        const { splat } = this.passes;
        const previous = this.renderer.getRenderTarget();
        splat.point.set(x, y);
        // Equal force per screen pixel in x and y (velocity is in texels; a UV step is width texels in x, height in y).
        splat.color.set(dx * SPLAT_FORCE * Math.min(this.aspect, 1), (dy * SPLAT_FORCE) / Math.max(this.aspect, 1), 0);
        this.run(splat, { uTarget: this.velocity }, this.targets.velocity);
        this.renderer.setRenderTarget(previous);
    }

    /** Advances the fluid by dt seconds: keep swirls, make the field divergence-free, then move it along itself. */
    step(dt) {
        const { velocity, pressure, divergence, curl } = this.targets;
        const { passes } = this;
        const previous = this.renderer.getRenderTarget();
        // Dissipation constants are per 60 Hz frame; scale them by the real step so 120 Hz fades at the same speed.
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

        this.renderer.setRenderTarget(previous);
    }

    dispose() {
        Object.values(this.targets).forEach((target) => target.dispose());
        Object.values(this.passes).forEach((pass) => pass.dispose());
        this.quad.dispose();
    }
}
