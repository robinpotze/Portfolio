import { useThree } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import * as THREE from 'three';

/**
 * Creates a THREE.VideoTexture from a video URL.
 *
 * Replaces drei's `useVideoTexture`, which statically imports hls.js (~1.4 MB of source) for unserved
 * `.m3u8` streams. Returns `null` until the video is ready so callers can render
 * a fallback instead of suspending.
 *
 * @param {string} src - Video URL.
 * @param {object} [options]
 * @param {keyof HTMLMediaElementEventMap} [options.unsuspend='loadedmetadata'] - Event that marks the video ready.
 * @param {boolean} [options.start=true] - Play as soon as it is ready.
 * @returns {THREE.VideoTexture | null}
 */
export default function useVideoTexture(src, { unsuspend = 'loadedmetadata', start = true, ...videoProps } = {}) {
    const gl = useThree((state) => state.gl);
    const [texture, setTexture] = useState(null);

    useEffect(() => {
        const video = Object.assign(document.createElement('video'), {
            src,
            crossOrigin: 'anonymous',
            muted: true,
            loop: true,
            playsInline: true,
            ...videoProps,
        });

        let created = null;
        const onReady = () => {
            created = new THREE.VideoTexture(video);
            created.colorSpace = gl.outputColorSpace;
            setTexture(created);
            if (start) {
                video.play().catch(() => {});
            }
        };

        video.addEventListener(unsuspend, onReady, { once: true });

        return () => {
            video.removeEventListener(unsuspend, onReady);
            video.pause();
            video.removeAttribute('src');
            video.load();
            created?.dispose();
            setTexture(null);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [src, unsuspend, start, gl]);

    return texture;
}
