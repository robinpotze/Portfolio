import useVideoTexture from '@canvas/core/textures/useVideoTexture';
import { useGLTF } from '@react-three/drei';
import { memo, useEffect } from 'react';
import * as THREE from 'three';

// Video-textured background wall; a dark placeholder material shows until the video can play.
function BackgroundMesh({ paused = false, ...props }) {
    const video = useVideoTexture('/assets/video/blackwall.mp4', {
        unsuspend: 'canplaythrough',
        start: true,
        crossOrigin: 'anonymous',
        muted: true,
        loop: true,
        playsInline: true,
    });
    const { nodes } = useGLTF('/assets/3d/Wall.glb');

    // No mipmaps for a video texture: it re-uploads every frame.
    if (video) {
        video.minFilter = THREE.LinearFilter;
        video.magFilter = THREE.LinearFilter;
        video.generateMipmaps = false;
    }

    useEffect(() => {
        const el = video?.image;
        if (!el) {
            return;
        }
        if (paused) {
            el.pause();
        } else {
            el.play().catch(() => {});
        }
    }, [paused, video]);

    return (
        <mesh geometry={nodes.Wall.geometry} {...props}>
            {video ? (
                <meshStandardMaterial
                    key="video"
                    map={video}
                    map-flipY={false}
                    emissive="#FFF"
                    emissiveMap={video}
                    emissiveIntensity={0.3}
                    toneMapped={false}
                />
            ) : (
                <meshStandardMaterial key="placeholder" color="#000000" emissive="#111111" emissiveIntensity={0.5} />
            )}
        </mesh>
    );
}

export default memo(BackgroundMesh);
