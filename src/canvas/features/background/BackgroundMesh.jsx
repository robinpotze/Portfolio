import { useGLTF } from '@react-three/drei';
import { memo, useEffect } from 'react';

function BackgroundMeshInner({ video, paused = false, ...props }) {
    const { nodes } = useGLTF('/assets/3d/Wall.glb');

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
