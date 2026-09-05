---
description: 'Use when writing or editing React Three Fiber scenes, canvas components, 3D meshes, camera rigs, or post-processing effects in the canvas directory.'
applyTo: 'src/canvas/**'
---

# R3F & Three.js Canvas Patterns

## Canvas Setup

Wrap each page's 3D scene in a Canvas component with these standard options:

```jsx
<Canvas
    shadows
    dpr={[1, 2]}
    performance={{ min: 0.5 }}
    eventSource={document.getElementById('root')}
    eventPrefix="client"
    gl={{
        antialias: true,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: false,
        alpha: false,
        stencil: false,
    }}
>
    <MyScene scrollProgress={scrollProgress} />
</Canvas>
```

## Scene Architecture

- **Canvas wrapper** (`HomeCanvas`, `WorkCanvas`) — configures WebGL renderer, passes scroll/animation props to scene
- **Scene component** (`HomeScene`, `WorkScene`) — orchestrates camera, meshes, lights, and post-processing
- **Shared resources** live in `src/canvas/shared/`:
    - `camera/Rig.jsx` — reusable camera rig
    - `materials/` — custom shader materials (e.g. `GlassLogoMaterial`)
    - `meshes/` — reusable mesh components (`LogoMesh`, `BackgroundMesh`)
    - `shaders/` — GLSL source files

## Scroll-Driven Animation

Scenes receive a normalized `scrollProgress` prop (0–1) from the page component. Use this to drive camera movement, object transforms, and material uniforms via `useFrame`:

```jsx
useFrame(() => {
    mesh.current.position.y = THREE.MathUtils.lerp(startY, endY, scrollProgress);
});
```

## Custom Hooks

- `useCameraAnimation(cameraRef, config)` — animate camera position/target based on scroll or triggers
- `useObjectAnimation(meshRef, config)` — animate mesh transforms (position, rotation, scale)
- `useAdaptiveQuality({ targetFps, enabled })` — returns `{ quality, fps }` to drive post-processing settings

## Adaptive Quality Pattern

Monitor FPS and memoize post-processing settings per tier:

```jsx
const { quality } = useAdaptiveQuality({ targetFps: 55, enabled: true });

const ppSettings = useMemo(() => {
    switch (quality) {
        case 'low':
            return { aoSamples: 4, bloomLevels: 4 };
        case 'medium':
            return { aoSamples: 6, bloomLevels: 5 };
        case 'high':
        default:
            return { aoSamples: 8, bloomLevels: 6 };
    }
}, [quality]);
```

## Shader Materials

Use `shaderMaterial` from drei + `extend` from fiber:

```jsx
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import fragShader from '../shaders/MyFrag.glsl?raw';
import vertShader from '../shaders/MyVert.glsl?raw';

const MyMaterial = shaderMaterial({ uTime: 0, uResolution: new THREE.Vector2() }, vertShader, fragShader);

extend({ MyMaterial });
```

## Post-Processing

Use `@react-three/postprocessing` with `EffectComposer`:

```jsx
<EffectComposer multisampling={ppSettings.multisampling}>
    <N8AO aoSamples={ppSettings.aoSamples} intensity={ppSettings.aoIntensity} />
    <Bloom intensity={ppSettings.bloomIntensity} levels={ppSettings.bloomLevels} />
</EffectComposer>
```

## Imports

Use drei helpers (`Float`, `PerspectiveCamera`, `Text`, `Environment`) over raw Three.js equivalents where available. Import Three.js as `import * as THREE from 'three'`.
