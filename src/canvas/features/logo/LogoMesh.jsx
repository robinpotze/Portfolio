import createMatcapTexture from '@canvas/core/textures/createMatcapTexture';
import { useGLTF } from '@react-three/drei';
import { memo, useEffect, useMemo } from 'react';

// Fallback logo for devices that cannot render to float textures (chosen in HomeScene).
function LogoMesh() {
    const { nodes } = useGLTF('/assets/3d/Logo.glb');
    const matcap = useMemo(() => createMatcapTexture(), []);

    useEffect(() => () => matcap.dispose(), [matcap]);

    return (
        <mesh geometry={nodes.Logo.geometry}>
            <meshMatcapMaterial matcap={matcap} />
        </mesh>
    );
}

export default memo(LogoMesh);
