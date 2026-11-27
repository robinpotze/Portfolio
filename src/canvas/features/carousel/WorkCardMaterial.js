import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';
import { CAROUSEL_CONFIG } from './carousel.config';
import fragShader from './workCard.frag.glsl?raw';
import vertShader from './workCard.vert.glsl?raw';

const WorkCardMaterial = shaderMaterial(
    {
        uTexture: null,
        uNoiseTex: null,
        uTextureSize: new THREE.Vector2(1, 1),
        uPlaneSize: new THREE.Vector2(1, 1),
        uRoughness: 0.1,
        uNoiseScale: 2.0,
        uRefractPower: 0.006,
        uChromaticAberration: 0.8,
        uDissolve: 1,
        uCells: new THREE.Vector2(...CAROUSEL_CONFIG.DISSOLVE.CELLS),
        uEdge: CAROUSEL_CONFIG.DISSOLVE.EDGE,
        uEdgeColor: new THREE.Color(),
    },
    vertShader,
    fragShader
);

extend({ WorkCardMaterial });

export default WorkCardMaterial;
