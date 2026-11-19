import { useQuality } from '@app/QualityContext';
import { useFrame } from '@react-three/fiber';
import { Bloom, EffectComposer, N8AO } from '@react-three/postprocessing';
import { useRef } from 'react';
import * as THREE from 'three';

const { lerp } = THREE.MathUtils;

// Home: ambient occlusion (off on low) + bloom. Work: bloom only. Values per quality tier, from the former scene files.
const HOME = {
    low: { ao: null, bloom: { intensity: 0.3, levels: 2 } },
    medium: { ao: { aoSamples: 4, denoiseSamples: 2, intensity: 1.2 }, bloom: { intensity: 0.45, levels: 4 } },
    high: { ao: { aoSamples: 8, denoiseSamples: 4, intensity: 1.5 }, bloom: { intensity: 0.55, levels: 6 } },
};
const WORK_BLOOM = { low: 0.2, medium: 0.3, high: 0.4 };

/** One effect chain for the layout: AO fades out and bloom blends from Home to Work over the morph. */
export default function PostFX({ segmentsRef }) {
    const { quality } = useQuality();
    const home = HOME[quality];
    const aoRef = useRef();
    const bloomRef = useRef();

    useFrame(() => {
        const { morph } = segmentsRef.current;
        if (aoRef.current && home.ao) {
            aoRef.current.configuration.intensity = home.ao.intensity * (1 - morph);
        }
        if (bloomRef.current) {
            bloomRef.current.intensity = lerp(home.bloom.intensity, WORK_BLOOM[quality], morph);
        }
    });

    return (
        <EffectComposer multisampling={0}>
            {home.ao && <N8AO ref={aoRef} aoRadius={1} {...home.ao} />}
            <Bloom ref={bloomRef} mipmapBlur luminanceThreshold={0.92} radius={0.4} {...home.bloom} />
        </EffectComposer>
    );
}
