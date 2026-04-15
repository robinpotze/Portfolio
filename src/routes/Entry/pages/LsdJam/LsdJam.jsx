import ScrollReveal from '@components/effects/ScrollReveal';
import CaseIntro from '@components/ui/CaseIntro/CaseIntro';
import ComparisonBlock from '@components/ui/ComparisonBlock/ComparisonBlock';
import DoubleImage from '@components/ui/DoubleImage/DoubleImage';
import EvidenceRow from '@components/ui/EvidenceRow/EvidenceRow';
import FeatureSplit from '@components/ui/FeatureSplit/FeatureSplit';
import FullImage from '@components/ui/FullImage/FullImage';
import HeroStatement from '@components/ui/HeroStatement/HeroStatement';
import StatementBlock from '@components/ui/StatementBlock/StatementBlock';
import WorkHeader from '@components/ui/WorkHeader/WorkHeader';

const assetPath = '/img/work/lsdjam/';

export default function LsdJam() {
    return (
        <>
            {/* ── INTRO ── */}

            <CaseIntro
                src={`${assetPath}Corridor.png`}
                kicker="LSD JAM / 2024"
                heading="Which reality is yours?"
                subtitle="3D artist and level designer for a reality-bending game jam."
            />

            {/* ── ROLE ── */}

            <StatementBlock label="ROLE">
                <h2>3D art, textures, level design, and lighting.</h2>
                <ScrollReveal>
                    Partnered with Cyril Ojoga for the LSD Jam — a game jam themed around altered perception. I created all 3D art, textures, level
                    layouts, lighting setups, and promotional material. The game was built in Unity with Blender for 3D assets.
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
                subtitle="LVL_001:::HIBERNATION"
                description="The first level has you wake from cryosleep in an unknown spaceship. As you navigate narrow hallways, large storage rooms, and eventually reach the bridge, you realize a system error has awakened you — the sun is burning away the ship's systems as you've steered off-course."
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
                subtitle="ENVIRONMENT:::COMMAND_CENTER"
                description="The spaceship bridge represents the climax of the first level — a vast command center filled with failing systems and emergency lighting. Every element was designed to reinforce the tension between familiarity and disorientation."
            />

            <FullImage src={`${assetPath}SpaceShip.png`} alt="Low fidelity render of a spaceship bridge." />

            <FeatureSplit src={`${assetPath}SpaceShipClose.png`} alt="Close-up of spaceship bridge control panels." label="DETAIL">
                <h3>Analog controls in a digital world.</h3>
                <ScrollReveal>
                    The bridge design mixes retro analog controls with futuristic displays — creating an environment that feels simultaneously
                    familiar and alien, mirroring the game's theme of shifting realities.
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
                subtitle="LVL:::ALTERNATE_REALITY"
                description="One of the alternate realities the player experiences — a nostalgic space built around the warm glow of CRT monitors and the hiss of cassette tapes. The room serves as a stark contrast to the cold, failing spaceship."
            />

            <DoubleImage
                images={[
                    { src: `${assetPath}CasetteWire.png`, alt: 'Wireframe render of the cassette room scene.' },
                    { src: `${assetPath}CassetteRoom.png`, alt: 'Final render of a retro-futurist room with a VR setup.' },
                ]}
            />

            {/* ── CLOSING ── */}

            <HeroStatement label="OUTCOME">
                <h2>Multiple realities, one cohesive visual language.</h2>
                <ScrollReveal>
                    A reality-bending game jam entry with handcrafted 3D environments that blur the line between waking and dreaming — each level a
                    distinct world that questions which reality is real.
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
