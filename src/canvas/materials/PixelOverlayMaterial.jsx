import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';
import fragShader from '../shaders/pixelOverlay/pixelOverlay.frag?raw';
import vertShader from '../shaders/pixelOverlay/pixelOverlay.vert?raw';

const PixelOverlayMaterial = shaderMaterial(
    {
        uTime: 0,
        uHover: 0,
        uResolution: new THREE.Vector2(800, 450),
        uColor1: new THREE.Color('#eeeeee'),
        uColor2: new THREE.Color('#2ad0d5'),
    },
    vertShader,
    fragShader
);

extend({ PixelOverlayMaterial });

export default PixelOverlayMaterial;
