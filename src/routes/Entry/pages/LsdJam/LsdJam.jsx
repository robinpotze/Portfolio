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

const assetPath = '/assets/img/work/lsdjam/';

export default function LsdJam() {
    return (
        <>
            {/* ── INTRO ── */}

            <CaseIntro
                src={`${assetPath}Animation.mp4`}
                kicker="LSD JAM / 2024"
                heading="An unfinished jam game about shifting realities."
                subtitle="3D artist, with Cyril Ojoga as programmer."
            />

            {/* ── CONTEXT ── */}

            <StatementBlock label="CONTEXT">
                <h2>LSD Jam, April 2024</h2>
                <ScrollReveal>
                    The theme of the jam was LSD. Cyril Ojoga and I worked on the game for about 72 hours in Unity. I was the artist and Cyril the
                    programmer. We never finished it, so it never got a name beyond LSDJam.
                </ScrollReveal>
            </StatementBlock>

            <EvidenceRow
                items={[
                    { label: 'ROLE', value: '3D art' },
                    { label: 'TEAM', value: 'Cyril Ojoga and me' },
                    { label: 'DURATION', value: '~72 hours' },
                    { label: 'OUTPUT', value: 'Unfinished (DNF)' },
                ]}
            />

            <StatementBlock label="APPROACH">
                <h2>Linear realities</h2>
                <ScrollReveal>
                    The player goes through several realities, each of which could be their actual one. Each is a short, linear experience that ends
                    with the player dying and waking up in the next, until they are left questioning which one was real. I made all models, textures,
                    animations, materials and shaders.
                </ScrollReveal>
            </StatementBlock>

            {/* ── HIBERNATION ── */}

            <WorkHeader
                title="COMMAND_ROOM"
                subtitle="001:::HIBERNATION"
                description="The first reality: the player wakes from cryosleep aboard an unknown ship after a system error, with the ship heading into the sun."
            />

            <FullImage src={`${assetPath}hibernation.png`} alt="A retro-futurist room with a VR setup in the middle." />

            <DoubleImage
                images={[
                    {
                        src: `${assetPath}hibernation close up.png`,
                        alt: 'Close-up of cryosleep pod with retro-futurist details.',
                    },
                    {
                        src: `${assetPath}hibernation close up 2.png`,
                        alt: 'Close-up of hibernation chamber control panel.',
                    },
                ]}
            />

            {/* ── SPACESHIP ── */}

            <WorkHeader
                title="THE BRIDGE"
                subtitle="002:::COMMAND_CENTER"
                description="The end of the first reality: the ship's command center, with failing systems and emergency lighting."
            />

            <FullImage src={`${assetPath}SpaceShip.png`} alt="Low fidelity render of a spaceship bridge." />

            <FeatureSplit src={`${assetPath}SpaceShipClose.png`} alt="Close-up of spaceship bridge control panels." label="CONTROL PANEL">
                <h3>Screen-based controls</h3>
                <ScrollReveal>The bridge is operated through screens, like the start-procedure panel shown here.</ScrollReveal>
            </FeatureSplit>

            <ComparisonBlock
                label="PROCESS"
                heading="Bridge, wireframe and render"
                items={[
                    {
                        caption: 'WIREFRAME',
                        src: `${assetPath}SpaceShipWire.png`,
                        alt: 'Wireframe render of the spaceship bridge.',
                    },
                    {
                        caption: 'FINAL RENDER',
                        src: `${assetPath}SpaceShip2.png`,
                        alt: 'Final rendered spaceship bridge with lighting.',
                    },
                ]}
            />

            {/* ── CASSETTE ROOM ── */}

            <WorkHeader
                title="CASSETTE_ROOM"
                subtitle="003:::ALTERNATE_REALITY"
                description="A second reality: the player wakes up from VR, stuck in a central seat, somewhat like The Matrix. A CRT on a robot arm is presented to them, and all interaction in this level happens through it."
            />

            <DoubleImage
                images={[
                    {
                        src: `${assetPath}CasetteWire.png`,
                        alt: 'Wireframe render of the cassette room scene.',
                    },
                    {
                        src: `${assetPath}CassetteRoom.png`,
                        alt: 'Final render of a retro-futurist room with a VR setup.',
                    },
                ]}
            />

            {/* ── CLOSING ── */}

            <HeroStatement label="OUTCOME">
                <h2>Status and hindsight</h2>
                <ScrollReveal>
                    We did not finish the game within the jam, so it has no results beyond a DNF. The environments on this page are the parts I
                    completed. In hindsight, we needed a much smaller scope, and I should have spent far less time on the cassette room. A jam is
                    about making a lot of things quickly; I made them with a ton of detail instead.
                </ScrollReveal>
            </HeroStatement>

            <EvidenceRow
                items={[
                    { label: '3D ART', value: 'Models, textures, animation, materials, shaders' },
                    { label: 'PROMOTION', value: 'Key art, branding' },
                    { label: 'TOOLS', value: 'Unity, Blender, Illustrator' },
                ]}
            />
        </>
    );
}
