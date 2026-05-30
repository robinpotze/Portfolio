---
description: 'Use when writing or editing GLSL shaders, vertex shaders, fragment shaders, or shader uniforms for Three.js materials.'
applyTo: src/canvas/**/shaders/**
---

# GLSL Shader Conventions

## File Extensions

Two conventions are used in this project — both are valid:

- `.glsl` — general purpose or when vertex/fragment is distinguished by filename (`GlassVert.glsl`, `GlassFrag.glsl`)
- `.vert` / `.frag` — explicit extension-based convention (`laser.vert`, `laser.frag`)

Group related shaders in subdirectories (e.g. `shaders/glass/`, `shaders/laser/`).

## Importing Shaders

Import shader source as raw strings using `?raw` with the `vite-plugin-glsl` plugin:

```javascript
import fragShader from '../shaders/glass/GlassFrag.glsl?raw';
import vertShader from '../shaders/glass/GlassVert.glsl?raw';
```

## Integration with R3F

Use drei's `shaderMaterial` factory + fiber's `extend` to register custom materials as JSX elements:

```jsx
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';

const MyMaterial = shaderMaterial({ uTime: 0, uResolution: new THREE.Vector2() }, vertShader, fragShader);

extend({ MyMaterial });
// Then use <myMaterial /> in JSX (lowercase first letter)
```

## Uniform Naming

- Prefix uniforms with `u` — `uTime`, `uResolution`, `uProgress`, `uIntensity`
- Texture uniforms use `u` + descriptive name or `t` prefix — `uNoiseTex`, `uEnvMap`, `tFrom`, `tTo`

## Varying Naming

- Prefix varyings with `v` — `vUv`, `vNormal`, `vViewPos`, `vWorldNormal`

## Code Style

- Use `precision mediump float` or `precision highp float` as appropriate
- Define constants with `#define` — `#define PI 3.14159265359`
- Keep helper functions (noise, easing, SDF) above `main()`
- Use compact formatting for math-heavy code — spaces around operators are optional in shader code
