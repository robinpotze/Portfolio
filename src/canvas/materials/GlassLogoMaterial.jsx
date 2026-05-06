import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import glassFragmentShader from '../shaders/glass/GlassFrag.glsl?raw';
import glassVertexShader from '../shaders/glass/GlassVert.glsl?raw';
import * as THREE from 'three';

export const GlassLogoMaterial = shaderMaterial(
    {
        uTrnsTex: null,
        uNoiseTex: null,
        uEnvMap: null,
        uTime: 0,
        uHasTransmission: 0,
        uOpacity: 1,
        uRoughness: 0.3,
        uNoiseScale: 2.0,
        uRefractPower: 0.1,
        uChromaticAberration: 0.02,
        uResolution: new THREE.Vector2(1024, 1024),
    },
    glassVertexShader,
    glassFragmentShader
);

extend({ GlassLogoMaterial });
