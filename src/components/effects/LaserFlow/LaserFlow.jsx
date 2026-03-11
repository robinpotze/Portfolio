import laserFragmentShader from '@canvas/shared/shaders/laser/laser.frag?raw';
import laserVertexShader from '@canvas/shared/shaders/laser/laser.vert?raw';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import styles from './LaserFlow.module.css';

const hexToRGB = hex => {
    let c = hex.trim();
    if (c[0] === '#') c = c.slice(1);
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const n = parseInt(c, 16) || 0xffffff;
    return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
};

export default function LaserFlow({
    className,
    style,
    wispDensity = 1.0,
    dpr,
    mouseSmoothTime = 0.0,
    mouseTiltStrength = 0.01,
    horizontalBeamOffset = 0.0,
    verticalBeamOffset = 0.0,
    flowSpeed = 0.35,
    verticalSizing = 2.0,
    horizontalSizing = 0.5,
    fogIntensity = 0.45,
    fogScale = 0.1,
    wispSpeed = 15.0,
    wispIntensity = 5.0,
    flowStrength = 0.25,
    decay = 1.5,
    falloffStart = 1.2,
    fogFallSpeed = 0.6,
    color = '#FF79C6'
}) {
    const mountRef = useRef(null);
    const rendererRef = useRef(null);
    const uniformsRef = useRef(null);
    const hasFadedRef = useRef(false);
    const rectRef = useRef(null);

    useEffect(() => {
        const mount = mountRef.current;
        window.scrollTo(0, 0);

        const baseDpr = Math.min(dpr ?? (window.devicePixelRatio || 1), 2);
        let currentDpr = baseDpr;
        const lastSize = { width: 0, height: 0, dpr: 0 };
        const fpsSamples = [];
        let lastFpsCheck = performance.now();
        let emaDt = 16.7;
        let paused = false;
        let inView = true;
        let lastDprChange = 0;

        const renderer = new THREE.WebGLRenderer({
            antialias: false,
            alpha: true,
            depth: false,
            stencil: false,
            powerPreference: 'high-performance',
            premultipliedAlpha: true,
            preserveDrawingBuffer: false,
            failIfMajorPerformanceCaveat: false,
            logarithmicDepthBuffer: false
        });
        rendererRef.current = renderer;

        renderer.setPixelRatio(currentDpr);
        renderer.shadowMap.enabled = false;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.setClearColor(0x000000, 0);
        const canvas = renderer.domElement;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';
        mount.appendChild(canvas);

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));

        const uniforms = {
            iTime: { value: 0 },
            iResolution: { value: new THREE.Vector3(1, 1, 1) },
            iMouse: { value: new THREE.Vector4(0, 0, 0, 0) },
            uWispDensity: { value: wispDensity },
            uTiltScale: { value: mouseTiltStrength },
            uFlowTime: { value: 0 },
            uFogTime: { value: 0 },
            uBeamXFrac: { value: horizontalBeamOffset },
            uBeamYFrac: { value: verticalBeamOffset },
            uFlowSpeed: { value: flowSpeed },
            uVLenFactor: { value: verticalSizing },
            uHLenFactor: { value: horizontalSizing },
            uFogIntensity: { value: fogIntensity },
            uFogScale: { value: fogScale },
            uWSpeed: { value: wispSpeed },
            uWIntensity: { value: wispIntensity },
            uFlowStrength: { value: flowStrength },
            uDecay: { value: decay },
            uFalloffStart: { value: falloffStart },
            uFogFallSpeed: { value: fogFallSpeed },
            uColor: { value: new THREE.Vector3(1, 1, 1) },
            uFade: { value: hasFadedRef.current ? 1 : 0 }
        };
        uniformsRef.current = uniforms;

        const material = new THREE.RawShaderMaterial({
            vertexShader: laserVertexShader,
            fragmentShader: laserFragmentShader,
            uniforms,
            transparent: false,
            depthTest: false,
            depthWrite: false,
            blending: THREE.NormalBlending
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.frustumCulled = false;
        scene.add(mesh);

        const clock = new THREE.Clock();
        let prevTime = 0;
        let fade = hasFadedRef.current ? 1 : 0;

        const mouseTarget = new THREE.Vector2(0, 0);
        const mouseSmooth = new THREE.Vector2(0, 0);

        const setSizeNow = () => {
            let w = mount.clientWidth || window.innerWidth;
            let h = mount.clientHeight || window.innerHeight;
            const pr = currentDpr;

            if (Math.abs(w - lastSize.width) < 0.5 && Math.abs(h - lastSize.height) < 0.5 && Math.abs(pr - lastSize.dpr) < 0.01) {
                return;
            }

            lastSize.width = w;
            lastSize.height = h;
            lastSize.dpr = pr;
            renderer.setPixelRatio(pr);
            renderer.setSize(w, h, false);
            uniforms.iResolution.value.set(w * pr, h * pr, pr);
            rectRef.current = canvas.getBoundingClientRect();

            if (!paused) renderer.render(scene, camera);
        };

        let resizeRaf = 0;
        const scheduleResize = () => {
            if (resizeRaf) cancelAnimationFrame(resizeRaf);
            resizeRaf = requestAnimationFrame(setSizeNow);
        };

        requestAnimationFrame(() => requestAnimationFrame(setSizeNow));

        const updateMouse = (clientX, clientY) => {
            const rect = rectRef.current;
            if (!rect) { return; }
            const x = clientX - rect.left;
            const y = clientY - rect.top;
            const ratio = currentDpr;
            const hb = rect.height * ratio;
            mouseTarget.set(x * ratio, hb - y * ratio);
        };

        const onMove = ev => updateMouse(ev.clientX, ev.clientY);
        const onLeave = () => mouseTarget.set(0, 0);
        const onVis = () => { paused = document.hidden; };
        const onCtxLost = e => { e.preventDefault(); paused = true; };
        const onCtxRestored = () => { paused = false; scheduleResize(); };

        canvas.addEventListener('pointermove', onMove, { passive: true });
        canvas.addEventListener('pointerdown', onMove, { passive: true });
        canvas.addEventListener('pointerenter', onMove, { passive: true });
        canvas.addEventListener('pointerleave', onLeave, { passive: true });
        canvas.addEventListener('webglcontextlost', onCtxLost, false);
        canvas.addEventListener('webglcontextrestored', onCtxRestored, false);
        document.addEventListener('visibilitychange', onVis, { passive: true });

        const ro = new ResizeObserver(scheduleResize);
        ro.observe(mount);

        const io = new IntersectionObserver(entries => {
            inView = entries[0]?.isIntersecting ?? true;
        }, { root: null, threshold: 0 });
        io.observe(mount);

        const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

        const adjustDprIfNeeded = now => {
            const elapsed = now - lastFpsCheck;
            if (elapsed < 750 || fpsSamples.length === 0) { return; }

            const avgFps = fpsSamples.reduce((a, b) => a + b, 0) / fpsSamples.length;
            let next = currentDpr;

            if (avgFps < 50) {
                next = clamp(currentDpr * 0.85, 0.6, baseDpr);
            } else if (avgFps > 58 && currentDpr < baseDpr) {
                next = clamp(currentDpr * 1.1, 0.6, baseDpr);
            }

            if (Math.abs(next - currentDpr) > 0.01 && now - lastDprChange > 2000) {
                currentDpr = next;
                lastDprChange = now;
                setSizeNow();
            }

            fpsSamples.length = 0;
            lastFpsCheck = now;
        };

        let raf = 0;
        const animate = () => {
            raf = requestAnimationFrame(animate);
            if (paused || !inView) { return; }

            const t = clock.getElapsedTime();
            const dt = Math.max(0, t - prevTime);
            prevTime = t;

            const dtMs = dt * 1000;
            emaDt = emaDt * 0.9 + dtMs * 0.1;
            const instFps = 1000 / Math.max(1, emaDt);
            fpsSamples.push(instFps);

            uniforms.iTime.value = t;

            const cdt = Math.min(0.033, Math.max(0.001, dt));
            uniforms.uFlowTime.value += cdt;
            uniforms.uFogTime.value += cdt;

            if (!hasFadedRef.current) {
                fade = Math.min(1, fade + cdt);
                uniforms.uFade.value = fade;
                if (fade >= 1) hasFadedRef.current = true;
            }

            const tau = Math.max(1e-3, mouseSmoothTime);
            const alpha = 1 - Math.exp(-cdt / tau);
            mouseSmooth.lerp(mouseTarget, alpha);
            uniforms.iMouse.value.set(mouseSmooth.x, mouseSmooth.y, 0, 0);

            renderer.render(scene, camera);
            adjustDprIfNeeded(performance.now());
        };

        animate();

        return () => {
            cancelAnimationFrame(raf);
            ro.disconnect();
            io.disconnect();
            document.removeEventListener('visibilitychange', onVis);
            canvas.removeEventListener('pointermove', onMove);
            canvas.removeEventListener('pointerdown', onMove);
            canvas.removeEventListener('pointerenter', onMove);
            canvas.removeEventListener('pointerleave', onLeave);
            canvas.removeEventListener('webglcontextlost', onCtxLost);
            canvas.removeEventListener('webglcontextrestored', onCtxRestored);
            geometry.dispose();
            material.dispose();
            renderer.dispose();
            if (mount.contains(canvas)) mount.removeChild(canvas);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dpr]);

    useEffect(() => {
        const uniforms = uniformsRef.current;
        if (!uniforms) { return; }

        uniforms.uWispDensity.value = wispDensity;
        uniforms.uTiltScale.value = mouseTiltStrength;
        uniforms.uBeamXFrac.value = horizontalBeamOffset;
        uniforms.uBeamYFrac.value = verticalBeamOffset;
        uniforms.uFlowSpeed.value = flowSpeed;
        uniforms.uVLenFactor.value = verticalSizing;
        uniforms.uHLenFactor.value = horizontalSizing;
        uniforms.uFogIntensity.value = fogIntensity;
        uniforms.uFogScale.value = fogScale;
        uniforms.uWSpeed.value = wispSpeed;
        uniforms.uWIntensity.value = wispIntensity;
        uniforms.uFlowStrength.value = flowStrength;
        uniforms.uDecay.value = decay;
        uniforms.uFalloffStart.value = falloffStart;
        uniforms.uFogFallSpeed.value = fogFallSpeed;

        const { r, g, b } = hexToRGB(color || '#FFFFFF');
        uniforms.uColor.value.set(r, g, b);
    }, [
        wispDensity,
        mouseTiltStrength,
        horizontalBeamOffset,
        verticalBeamOffset,
        flowSpeed,
        verticalSizing,
        horizontalSizing,
        fogIntensity,
        fogScale,
        wispSpeed,
        wispIntensity,
        flowStrength,
        decay,
        falloffStart,
        fogFallSpeed,
        color
    ]);

    return <div ref={mountRef} className={`${styles.laserFlowContainer} ${className || ''}`} style={style} />;
}

