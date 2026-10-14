import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';
import { LOGO_PARTICLES } from './logoParticles.config';
import particlesFrag from './particles.frag.glsl';
import particlesVert from './particles.vert.glsl';

// Point material for LogoParticles: drei's shaderMaterial makes every uniform a property (material.uIntro = 1) and a JSX prop.
const LogoParticlesMaterial = shaderMaterial(
    {
        tPosition: null,
        tMatcap: null,
        uColor: new THREE.Color(),
        uPointSize: LOGO_PARTICLES.POINT_SIZE,
        uDpr: 1,
        uIntro: 0,
        uGridSize: new THREE.Vector2(),
        uTime: 0,
    },
    particlesVert,
    particlesFrag
);

extend({ LogoParticlesMaterial });

export default LogoParticlesMaterial;
