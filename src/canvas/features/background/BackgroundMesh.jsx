import useVideoTexture from '@canvas/core/textures/useVideoTexture';
import { useGLTF } from '@react-three/drei';
import { memo, useEffect } from 'react';
import * as THREE from 'three';

function BackgroundMeshInner({ paused = false, ...props }) {
    const video = useVideoTexture('/assets/video/blackwall.mp4', {
        unsuspend: 'canplaythrough',
        start: true,
        crossOrigin: 'anonymous',
        muted: true,
        loop: true,
        playsInline: true,
    });

    const { nodes } = useGLTF('/assets/3d/Wall.glb');

    // Set video texture to update less frequently for performance
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

    if (!video) {
        return <FallbackMesh {...props} />;
    }

    return (
        <mesh geometry={nodes.Wall.geometry} {...props}>
            <meshStandardMaterial
                map={video}
                map-flipY={false}
                emissive="#FFF"
                emissiveMap={video}
                emissiveIntensity={0.3} // Reduced from 0.5 for less processing
                toneMapped={false}
            />
        </mesh>
    );
}

// Fallback mesh while loading
function FallbackMesh(props) {
    const { nodes } = useGLTF('/assets/3d/Wall.glb');
    return (
        <mesh geometry={nodes.Wall.geometry} {...props}>
            <meshStandardMaterial color="#000000" emissive="#111111" emissiveIntensity={0.5} />
        </mesh>
    );
}

function BackgroundMesh(props) {
    return <BackgroundMeshInner {...props} />;
}

export default memo(BackgroundMesh);
