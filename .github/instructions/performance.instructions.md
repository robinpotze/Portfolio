---
description: "Use when optimizing render performance, configuring quality tiers, implementing adaptive quality, frame skipping, Canvas renderer settings, or conditional rendering based on device capability."
applyTo: "src/canvas/**, src/app/QualityContext.jsx, src/hooks/useAdaptiveQuality.js, src/utils/deviceCapability.js"
---
# Performance & Quality Tiers

## Three-Tier Quality System

Quality is managed globally via `QualityContext` with three tiers:

| Tier | When | Visual impact |
|------|------|---------------|
| `'low'` | Integrated GPU, ≤4 cores, or FPS drops below threshold | AO disabled, minimal bloom, no FBO, no shader overlays, no float motion |
| `'medium'` | FPS recovery from low, or moderate dip from high | AO with 4 samples, moderate bloom, reduced effects |
| `'high'` | Discrete GPU with good sustained FPS | Full AO (8 samples + 4 denoise), full bloom (6 levels), all effects |

### Initial Detection

`getDeviceTier()` in `src/utils/deviceCapability.js` runs once and caches the result. It checks WebGL debug info for GPU model:

- **Low:** Intel integrated, SwiftShader, LLVMPIPE, software renderers, ≤4 CPU cores
- **High:** Apple M-series, dedicated discrete GPUs, everything else

### Runtime Adaptation

`useAdaptiveQuality` monitors FPS inside the R3F render loop and adjusts tiers:

```javascript
const { quality, fps } = useAdaptiveQuality({ targetFps: 55, checkInterval: 1000, enabled: true });
```

**Switching thresholds (with targetFps = 55):**
- `avgFps < 45` → degrade one tier
- `avgFps < 50` → degrade from high to medium only
- `avgFps > 60` → upgrade one tier
- Minimum **2 seconds** between quality changes (prevents thrashing)

### Consuming Quality

```javascript
import { useQuality } from '@app/QualityContext';
const { quality } = useQuality();
const isLowQuality = quality === 'low';
```

## Post-Processing Per Tier

Memoize settings based on quality — recalculate only when tier changes:

```javascript
const ppSettings = useMemo(() => {
    switch (quality) {
        case 'low':
            return { enableAO: false, bloomIntensity: 0.3, bloomLevels: 2, multisampling: 0 };
        case 'medium':
            return { enableAO: true, aoSamples: 4, bloomIntensity: 0.45, bloomLevels: 4, multisampling: 0 };
        case 'high':
        default:
            return { enableAO: true, aoSamples: 8, bloomIntensity: 0.55, bloomLevels: 6, multisampling: 0 };
    }
}, [quality]);
```

Conditionally render expensive effects:

```javascript
<EffectComposer multisampling={ppSettings.multisampling}>
    {ppSettings.enableAO && <N8AO aoSamples={ppSettings.aoSamples} />}
    <Bloom intensity={ppSettings.bloomIntensity} levels={ppSettings.bloomLevels} />
</EffectComposer>
```

## Conditional Rendering

Skip entire meshes and shader overlays on low quality:

```javascript
{!isLowQuality && (
    <mesh position={[0, 0, 0.002]}>
        <pixelOverlayMaterial ref={materialRef} transparent depthWrite={false} />
    </mesh>
)}
```

Disable Float motion on low quality:

```javascript
<Float
    floatIntensity={quality !== 'low' ? FLOAT_CONFIG.INTENSITY : 0}
    rotationIntensity={quality !== 'low' ? FLOAT_CONFIG.ROTATION_INTENSITY : 0}
/>
```

## Frame Skipping

For expensive per-frame operations (camera parallax, FBO renders), skip every other frame:

```javascript
const frameCount = useRef(0);

useFrame((state, delta) => {
    frameCount.current++;
    if (frameCount.current % 2 !== 0) return;

    // Expensive operation runs at 30fps instead of 60fps
});
```

Use frame-rate-independent smoothing so skipped frames don't cause jitter:

```javascript
const smoothing = 1 - Math.pow(0.001, delta);
mesh.position.x += (target - mesh.position.x) * smoothing;
```

## Canvas Renderer Settings

Standard Canvas configuration:

```javascript
<Canvas
    dpr={[1, 1.5]}
    performance={{ min: 0.5 }}
    gl={{
        antialias: true,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: false,
        alpha: false,
        stencil: false,
    }}
>
```

| Setting | Purpose |
|---------|---------|
| `dpr={[1, 1.5]}` | Clamp pixel ratio between 1x and 1.5x (prevents 2x/3x on high-DPI) |
| `performance={{ min: 0.5 }}` | R3F can dynamically scale resolution down to 50% |
| `antialias: false` | Disable on carousel/card scenes where post-processing handles edges |
| `alpha: false, stencil: false` | Skip unused GPU buffers |

## Adding a New Quality-Sensitive Feature

When adding a feature that has a visual cost:

1. Check `quality` from `useQuality()` or accept `isLowQuality` as a prop
2. **Default to reducing** the feature on `'low'` — lower sample counts, fewer particles, simpler materials
3. **Only skip entirely** for inherently heavy features that are expensive even at minimum settings (post-processing passes, FBO renders, multi-pass shaders)
4. Use `useMemo` keyed on `quality` for config objects
5. If the feature runs in `useFrame`, consider frame skipping with `frameCount % N`
6. Add the feature to the post-processing settings switch if it affects the EffectComposer
