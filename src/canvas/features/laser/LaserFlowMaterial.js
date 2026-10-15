import { extend } from '@react-three/fiber';
import * as THREE from 'three';
import fragmentShader from './laser.frag.glsl?raw';
import vertexShader from './laser.vert.glsl?raw';

// Raw shader (no three.js prefix): the GLSL declares its own precision and attributes.
class LaserFlowMaterial extends THREE.RawShaderMaterial {
    constructor() {
        super({
            vertexShader,
            fragmentShader,
            uniforms: {
                // Set once by LaserPlane (brand color, sRGB 0–1)
                uColor: { value: new THREE.Vector3(1, 1, 1) },
                // Updated every frame by LaserPlane
                iResolution: { value: new THREE.Vector3(1, 1, 1) },
                iMouse: { value: new THREE.Vector4() },
                uFlowTime: { value: 0 },
                uFogTime: { value: 0 },
                uFade: { value: 0 },
                uFogQuality: { value: 1 },
                uWispDensity: { value: 1 },
                // Scroll-driven (laser.config.js)
                uHLenFactor: { value: 0.5 },
                uVLenFactor: { value: 2 },
                uBeamYFrac: { value: 0 },
                uFogIntensity: { value: 0.45 },
                uWSpeed: { value: 15 },
                uWIntensity: { value: 5 },
                uDecay: { value: 1.5 },
                // Constant look
                uBeamXFrac: { value: 0 },
                uFlowSpeed: { value: 0.35 },
                uFogScale: { value: 0.1 },
                uFlowStrength: { value: 0.25 },
                uFalloffStart: { value: 1.2 },
                uFogFallSpeed: { value: 0.6 },
                uTiltScale: { value: 0.01 },
            },
            transparent: true,
            depthTest: false,
            depthWrite: false,
        });
    }
}

extend({ LaserFlowMaterial });

export default LaserFlowMaterial;
