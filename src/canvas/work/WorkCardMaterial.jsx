import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';
import fragShader from './shaders/workCard.frag?raw';
import vertShader from './shaders/workCard.vert?raw';

const WorkCardMaterial = shaderMaterial(
    {
        uTexture: null,
        uNoiseTex: null,
        uTextureSize: new THREE.Vector2(1, 1),
        uPlaneSize: new THREE.Vector2(1, 1),
        uTime: 0,
        uRoughness: 0.1 ,
        uNoiseScale: 2.0,
        uRefractPower: 0.006,
        uChromaticAberration: 0.8,
    },
    vertShader,
    fragShader
);

extend({ WorkCardMaterial });

export default WorkCardMaterial;
