import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import laserFragmentShader from '../../../canvas/shared/shaders/laser/laser.frag?raw';
import laserVertexShader from '../../../canvas/shared/shaders/laser/laser.vert?raw';
import styles from './LaserFlow.module.css';

const VERT = laserVertexShader;
const FRAG = laserFragmentShader;

export const LaserFlow = ({
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
}) => {
    const mountRef = useRef(null);
    const rendererRef = useRef(null);
    const uniformsRef = useRef(null);
    const hasFadedRef = useRef(false);
    const rectRef = useRef(null);
    const baseDprRef = useRef(1);
    const currentDprRef = useRef(1);
    const lastSizeRef = useRef({ width: 0, height: 0, dpr: 0 });
    const fpsSamplesRef = useRef([]);
    const lastFpsCheckRef = useRef(performance.now());
    const emaDtRef = useRef(16.7);
    const pausedRef = useRef(false);
    const inViewRef = useRef(true);

    const hexToRGB = hex => {
        let c = hex.trim();
        if (c[0] === '#') c = c.slice(1);
        if (c.length === 3)
            c = c
                .split('')
                .map(x => x + x)
                .join('');
        const n = parseInt(c, 16) || 0xffffff;
        return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
    };

    useEffect(() => {
        const mount = mountRef.current;

        window.scrollTo(0, 0);

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

        baseDprRef.current = Math.min(dpr ?? (window.devicePixelRatio || 1), 2);
        currentDprRef.current = baseDprRef.current;

        renderer.setPixelRatio(currentDprRef.current);
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
            vertexShader: VERT,
            fragmentShader: FRAG,
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
            let w = mount.clientWidth || 1;
            let h = mount.clientHeight || 1;

            // Fallback if container hasn't computed size yet
            if (w === 0 || h === 0) {
                w = window.innerWidth;
                h = window.innerHeight;
            }

            const pr = currentDprRef.current;

            const last = lastSizeRef.current;
            const sizeChanged = Math.abs(w - last.width) > 0.5 || Math.abs(h - last.height) > 0.5;
            const dprChanged = Math.abs(pr - last.dpr) > 0.01;
            if (!sizeChanged && !dprChanged) {
                return;
            }

            lastSizeRef.current = { width: w, height: h, dpr: pr };
            renderer.setPixelRatio(pr);
            renderer.setSize(w, h, false);
            uniforms.iResolution.value.set(w * pr, h * pr, pr);
            rectRef.current = canvas.getBoundingClientRect();

            if (!pausedRef.current) {
                renderer.render(scene, camera);
            }
        };

        let resizeRaf = 0;
        const scheduleResize = () => {
            if (resizeRaf) cancelAnimationFrame(resizeRaf);
            resizeRaf = requestAnimationFrame(setSizeNow);
        };

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setSizeNow();
            });
        });

        const ro = new ResizeObserver(scheduleResize);
        ro.observe(mount);

        const io = new IntersectionObserver(
            entries => {
                inViewRef.current = entries[0]?.isIntersecting ?? true;
            },
            { root: null, threshold: 0 }
        );
        io.observe(mount);

        const onVis = () => {
            pausedRef.current = document.hidden;
        };
        document.addEventListener('visibilitychange', onVis, { passive: true });

        const updateMouse = (clientX, clientY) => {
            const rect = rectRef.current;
            if (!rect) return;
            const x = clientX - rect.left;
            const y = clientY - rect.top;
            const ratio = currentDprRef.current;
            const hb = rect.height * ratio;
            mouseTarget.set(x * ratio, hb - y * ratio);
        };
        const onMove = ev => updateMouse(ev.clientX, ev.clientY);
        const onLeave = () => mouseTarget.set(0, 0);
        canvas.addEventListener('pointermove', onMove, { passive: true });
        canvas.addEventListener('pointerdown', onMove, { passive: true });
        canvas.addEventListener('pointerenter', onMove, { passive: true });
        canvas.addEventListener('pointerleave', onLeave, { passive: true });

        const onCtxLost = e => {
            e.preventDefault();
            pausedRef.current = true;
        };
        const onCtxRestored = () => {
            pausedRef.current = false;
            scheduleResize();
        };
        canvas.addEventListener('webglcontextlost', onCtxLost, false);
        canvas.addEventListener('webglcontextrestored', onCtxRestored, false);

        let raf = 0;

        const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
        const dprFloor = 0.6;
        const lowerThresh = 50;
        const upperThresh = 58;
        let lastDprChangeRef = 0;
        const dprChangeCooldown = 2000;

        const adjustDprIfNeeded = now => {
            const elapsed = now - lastFpsCheckRef.current;
            if (elapsed < 750) return;

            const samples = fpsSamplesRef.current;
            if (samples.length === 0) {
                lastFpsCheckRef.current = now;
                return;
            }
            const avgFps = samples.reduce((a, b) => a + b, 0) / samples.length;

            let next = currentDprRef.current;
            const base = baseDprRef.current;

            if (avgFps < lowerThresh) {
                next = clamp(currentDprRef.current * 0.85, dprFloor, base);
            } else if (avgFps > upperThresh && currentDprRef.current < base) {
                next = clamp(currentDprRef.current * 1.1, dprFloor, base);
            }

            if (Math.abs(next - currentDprRef.current) > 0.01 && now - lastDprChangeRef > dprChangeCooldown) {
                currentDprRef.current = next;
                lastDprChangeRef = now;
                setSizeNow();
            }

            fpsSamplesRef.current = [];
            lastFpsCheckRef.current = now;
        };

        const animate = () => {
            raf = requestAnimationFrame(animate);
            if (pausedRef.current || !inViewRef.current) return;

            const t = clock.getElapsedTime();
            const dt = Math.max(0, t - prevTime);
            prevTime = t;

            const dtMs = dt * 1000;
            emaDtRef.current = emaDtRef.current * 0.9 + dtMs * 0.1;
            const instFps = 1000 / Math.max(1, emaDtRef.current);
            fpsSamplesRef.current.push(instFps);

            uniforms.iTime.value = t;

            const cdt = Math.min(0.033, Math.max(0.001, dt));
            uniforms.uFlowTime.value += cdt;
            uniforms.uFogTime.value += cdt;

            if (!hasFadedRef.current) {
                const fadeDur = 1.0;
                fade = Math.min(1, fade + cdt / fadeDur);
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
        if (!uniforms) return;

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
};

export default LaserFlow;
