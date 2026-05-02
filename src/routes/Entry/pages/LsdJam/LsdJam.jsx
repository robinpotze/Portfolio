import ScrollReveal from '@components/ui/ScrollReveal';
import CaseIntro from '@components/sections/CaseIntro/CaseIntro';
import ComparisonBlock from '@components/sections/ComparisonBlock/ComparisonBlock';
import DoubleImage from '@components/sections/DoubleImage/DoubleImage';
import EvidenceRow from '@components/sections/EvidenceRow/EvidenceRow';
import FeatureSplit from '@components/sections/FeatureSplit/FeatureSplit';
import FullImage from '@components/sections/FullImage/FullImage';
import HeroStatement from '@components/sections/HeroStatement/HeroStatement';
import StatementBlock from '@components/sections/StatementBlock/StatementBlock';
import WorkHeader from '@components/sections/WorkHeader/WorkHeader';

import { Data } from './lsdjam.data';

const assetPath = '/img/work/lsdjam/';

export default function LsdJam() {
    return (
        <>
            {/* ── INTRO ── */}

            <CaseIntro
                src={`${assetPath}Animation.mp4`}
                kicker={`LSD JAM / ${Data.year}`}
                heading="Which reality is yours?"
                subtitle="I participated as a 3D artist and level designer for a reality-bending game jam."
            />

            {/* ── ROLE ── */}

            <StatementBlock label="ROLE">
                <h2>Every environment. Every surface. Every light source.</h2>
                <ScrollReveal>
                    Partnered with Kiril Ojoga for the LSD Jam — a game jam themed around altered perception. All 3D art, textures, level layouts, and
                    lighting rigs were mine. Unity for the build, Blender and After Effects for the assets.
                </ScrollReveal>
            </StatementBlock>

            <EvidenceRow
                items={[
                    { label: 'EVENT', value: 'LSD Jam 2024' },
                    { label: 'TEAM', value: '2 developers' },
                    { label: 'ROLE', value: '3D Art, Level Design' },
                    { label: 'TOOLS', value: 'Unity, Blender, Illustrator' },
                ]}
            />

            {/* ── HIBERNATION ── */}

            <WorkHeader
                title="COMMAND_ROOM"
                subtitle="001:::HIBERNATION"
                description="You wake in cryosleep aboard an unknown ship. Narrow hallways lead to storage bays. Storage bays lead to the bridge. A system error pulled you out early — the sun is burning through the hull, and you're headed straight for it."
            />

            <FullImage src={`${assetPath}hibernation.png`} alt="A retro-futurist room with a VR setup in the middle." />

            <DoubleImage
                images={[
                    { src: `${assetPath}hibernation close up.png`, alt: 'Close-up of cryosleep pod with retro-futurist details.' },
                    { src: `${assetPath}hibernation close up 2.png`, alt: 'Close-up of hibernation chamber control panel.' },
                ]}
            />

            {/* ── SPACESHIP ── */}

            <WorkHeader
                title="THE BRIDGE"
                subtitle="002:::COMMAND_CENTER"
                description="The climax of the first level. A command center filled with failing systems and emergency lighting. Every panel, every screen, every flickering display designed to blur the line between what you recognize and what you don't."
            />

            <FullImage src={`${assetPath}SpaceShip.png`} alt="Low fidelity render of a spaceship bridge." />

            <FeatureSplit src={`${assetPath}SpaceShipClose.png`} alt="Close-up of spaceship bridge control panels." label="DETAIL">
                <h3>Analog controls in a digital world.</h3>
                <ScrollReveal>
                    Retro switches next to holographic readouts. The bridge was built to feel simultaneously familiar and alien — the same dissonance
                    the player feels when reality starts to shift.
                </ScrollReveal>
            </FeatureSplit>

            <ComparisonBlock
                label="PROCESS"
                heading="From wireframe to final render."
                items={[
                    { caption: 'WIREFRAME', src: `${assetPath}SpaceShipWire.png`, alt: 'Wireframe render of the spaceship bridge.' },
                    { caption: 'FINAL RENDER', src: `${assetPath}SpaceShip2.png`, alt: 'Final rendered spaceship bridge with lighting.' },
                ]}
            />

            {/* ── CASSETTE ROOM ── */}

            <WorkHeader
                title="CASSETTE_ROOM"
                subtitle="003:::ALTERNATE_REALITY"
                description="An alternate reality. CRT glow. Cassette hiss. A warm, analog room that shouldn't exist inside a freezing spaceship — but here it is. The contrast is the point."
            />

            <DoubleImage
                images={[
                    { src: `${assetPath}CasetteWire.png`, alt: 'Wireframe render of the cassette room scene.' },
                    { src: `${assetPath}CassetteRoom.png`, alt: 'Final render of a retro-futurist room with a VR setup.' },
                ]}
            />

            {/* ── CLOSING ── */}

            <HeroStatement label="OUTCOME">
                <h2>Every reality different. Every reality yours.</h2>
                <ScrollReveal>
                    A game jam entry built on the premise that nothing is stable — handcrafted 3D environments where each level questions what's real.
                    The visual language holds it together. The disorientation is designed.
                </ScrollReveal>
            </HeroStatement>

            <EvidenceRow
                items={[
                    { label: 'LEVELS', value: 'Multiple reality shifts' },
                    { label: '3D ART', value: 'Environments, props, lighting' },
                    { label: 'PROMOTION', value: 'Key art, branding' },
                ]}
            />
        </>
    );
}
