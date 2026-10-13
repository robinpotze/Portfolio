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

function createTarget(width, height) {
    return new THREE.WebGLRenderTarget(width, height, {
        type: THREE.HalfFloatType,
        format: THREE.RGBAFormat,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        depthBuffer: false,
    });
}

function createDoubleTarget(width, height) {
    let read = createTarget(width, height);
    let write = createTarget(width, height);
    return {
        get read() {
            return read;
        },
        get write() {
            return write;
        },
        swap() {
            [read, write] = [write, read];
        },
        dispose() {
            read.dispose();
            write.dispose();
        },
    };
}

/** Screen-space stable-fluids velocity field (no dye), at SIM_RESOLUTION on the short screen side. */
export default class FluidSim {
    constructor(renderer, aspect, iterations) {
        this.renderer = renderer;
        this.aspect = aspect;
        this.iterations = iterations;

        const width = Math.round(aspect >= 1 ? SIM_RESOLUTION * aspect : SIM_RESOLUTION);
        const height = Math.round(aspect >= 1 ? SIM_RESOLUTION : SIM_RESOLUTION / aspect);
        const texelSize = new THREE.Vector2(1 / width, 1 / height);

        this.velocityTargets = createDoubleTarget(width, height);
        this.pressureTargets = createDoubleTarget(width, height);
        this.divergenceTarget = createTarget(width, height);
        this.curlTarget = createTarget(width, height);
        this.quad = new FullScreenQuad();

        const pass = (fragmentShader, uniforms) =>
            new THREE.ShaderMaterial({
                vertexShader: baseVert,
                fragmentShader,
                uniforms: { texelSize: { value: texelSize }, ...uniforms },
                depthTest: false,
                depthWrite: false,
            });

        this.materials = {
            splat: pass(splatFrag, {
                uTarget: { value: null },
                aspectRatio: { value: aspect },
                point: { value: new THREE.Vector2() },
                color: { value: new THREE.Vector3() },
                radius: { value: SPLAT_RADIUS * Math.max(aspect, 1) },
            }),
            advect: pass(advectFrag, {
                uVelocity: { value: null },
                uSource: { value: null },
                dt: { value: 0 },
                dissipation: { value: VELOCITY_DISSIPATION },
            }),
            curl: pass(curlFrag, { uVelocity: { value: null } }),
            vorticity: pass(vorticityFrag, {
                uVelocity: { value: null },
                uCurl: { value: null },
                curl: { value: CURL },
                dt: { value: 0 },
            }),
            divergence: pass(divergenceFrag, { uVelocity: { value: null } }),
            clear: pass(clearFrag, { uTexture: { value: null }, value: { value: PRESSURE_DISSIPATION } }),
            pressure: pass(pressureFrag, { uPressure: { value: null }, uDivergence: { value: null } }),
            gradient: pass(gradientFrag, { uPressure: { value: null }, uVelocity: { value: null } }),
        };
    }

    get velocity() {
        return this.velocityTargets.read.texture;
    }

    render(material, target) {
        this.quad.material = material;
        this.renderer.setRenderTarget(target);
        this.quad.render(this.renderer);
    }

    splat(x, y, dx, dy) {
        const previous = this.renderer.getRenderTarget();
        const u = this.materials.splat.uniforms;
        u.uTarget.value = this.velocityTargets.read.texture;
        u.point.value.set(x, y);
        u.color.value.set(dx * SPLAT_FORCE, dy * SPLAT_FORCE, 0);
        this.render(this.materials.splat, this.velocityTargets.write);
        this.velocityTargets.swap();
        this.renderer.setRenderTarget(previous);
    }

    step(dt) {
        const previous = this.renderer.getRenderTarget();
        const { velocityTargets: velocity, pressureTargets: pressure, materials: m } = this;

        m.curl.uniforms.uVelocity.value = velocity.read.texture;
        this.render(m.curl, this.curlTarget);

        m.vorticity.uniforms.uVelocity.value = velocity.read.texture;
        m.vorticity.uniforms.uCurl.value = this.curlTarget.texture;
        m.vorticity.uniforms.dt.value = dt;
        this.render(m.vorticity, velocity.write);
        velocity.swap();

        m.divergence.uniforms.uVelocity.value = velocity.read.texture;
        this.render(m.divergence, this.divergenceTarget);

        m.clear.uniforms.uTexture.value = pressure.read.texture;
        this.render(m.clear, pressure.write);
        pressure.swap();

        m.pressure.uniforms.uDivergence.value = this.divergenceTarget.texture;
        for (let i = 0; i < this.iterations; i++) {
            m.pressure.uniforms.uPressure.value = pressure.read.texture;
            this.render(m.pressure, pressure.write);
            pressure.swap();
        }

        m.gradient.uniforms.uPressure.value = pressure.read.texture;
        m.gradient.uniforms.uVelocity.value = velocity.read.texture;
        this.render(m.gradient, velocity.write);
        velocity.swap();

        m.advect.uniforms.uVelocity.value = velocity.read.texture;
        m.advect.uniforms.uSource.value = velocity.read.texture;
        m.advect.uniforms.dt.value = dt;
        this.render(m.advect, velocity.write);
        velocity.swap();

        this.renderer.setRenderTarget(previous);
    }

    dispose() {
        this.velocityTargets.dispose();
        this.pressureTargets.dispose();
        this.divergenceTarget.dispose();
        this.curlTarget.dispose();
        Object.values(this.materials).forEach((material) => material.dispose());
        this.quad.dispose();
    }
}
