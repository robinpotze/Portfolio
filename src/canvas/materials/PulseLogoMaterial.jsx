import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';
import pulseFragmentShader from '../shaders/pulse/PulseFrag.glsl?raw';
import pulseVertexShader from '../shaders/pulse/PulseVert.glsl?raw';

export const PulseLogoMaterial = shaderMaterial(
    {
        uTime: 0,
        uProgress: 0,
        uOpacity: 1,
        uBoundsMin: new THREE.Vector2(-1, -1),
        uBoundsMax: new THREE.Vector2(1, 1),
    },
    pulseVertexShader,
    pulseFragmentShader
);

extend({ PulseLogoMaterial });
