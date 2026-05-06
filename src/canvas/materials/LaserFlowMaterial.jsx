import { extend } from '@react-three/fiber';
import * as THREE from 'three';
import laserFragmentShader from '../shaders/laser/laser.frag?raw';
import laserVertexShader from '../shaders/laser/laser.vert?raw';

class LaserFlowMaterial extends THREE.RawShaderMaterial {
    constructor() {
        super({
            vertexShader: laserVertexShader,
            fragmentShader: laserFragmentShader,
            uniforms: {
                iTime: { value: 0 },
                iResolution: { value: new THREE.Vector3(1, 1, 1) },
                iMouse: { value: new THREE.Vector4(0, 0, 0, 0) },
                uWispDensity: { value: 1.0 },
                uTiltScale: { value: 0.01 },
                uFlowTime: { value: 0 },
                uFogTime: { value: 0 },
                uBeamXFrac: { value: 0 },
                uBeamYFrac: { value: 0 },
                uFlowSpeed: { value: 0.35 },
                uVLenFactor: { value: 2.0 },
                uHLenFactor: { value: 0.5 },
                uFogIntensity: { value: 0.45 },
                uFogScale: { value: 0.1 },
                uWSpeed: { value: 15.0 },
                uWIntensity: { value: 5.0 },
                uFlowStrength: { value: 0.25 },
                uDecay: { value: 1.5 },
                uFalloffStart: { value: 1.2 },
                uFogFallSpeed: { value: 0.6 },
                uColor: { value: new THREE.Vector3(1, 1, 1) },
                uFade: { value: 0 },
                uFogQuality: { value: 1 },
            },
            transparent: true,
            depthTest: false,
            depthWrite: false,
        });
    }
}

extend({ LaserFlowMaterial });

export { LaserFlowMaterial };
