import ScrollReveal from '@components/ui/ScrollReveal';
import CaseIntro from '@components/sections/CaseIntro/CaseIntro';
import ComparisonBlock from '@components/sections/ComparisonBlock/ComparisonBlock';
import DoubleImage from '@components/sections/DoubleImage/DoubleImage';
import EvidenceRow from '@components/sections/EvidenceRow/EvidenceRow';
import FeatureSplit from '@components/sections/FeatureSplit/FeatureSplit';
import FullImage from '@components/sections/FullImage/FullImage';
import HeroStatement from '@components/sections/HeroStatement/HeroStatement';
import ImageGrid from '@components/sections/ImageGrid/ImageGrid';
import StatementBlock from '@components/sections/StatementBlock/StatementBlock';
import WorkHeader from '@components/sections/WorkHeader/WorkHeader';

const assetPath = '/assets/img/work/ld58/';

const BRAND_IMAGES = [
    { src: `${assetPath}Brands/9_WONDER.png`, alt: '9 Wonder beer label.' },
    { src: `${assetPath}Brands/ATOMBREW.png`, alt: 'Atombrew beer label.' },
    { src: `${assetPath}Brands/BEPIS.png`, alt: 'Bepis beer label.' },
    { src: `${assetPath}Brands/BIGBESTIE.png`, alt: 'Big Bestie beer label.' },
    { src: `${assetPath}Brands/BOMBOCLART.png`, alt: 'Bomboclart beer label.' },
    {
        src: `${assetPath}Brands/CLANKERGREASE.png`,
        alt: 'Clankergrease beer label.',
    },
    { src: `${assetPath}Brands/CYKACOLA.png`, alt: 'Cyka Cola beer label.' },
    { src: `${assetPath}Brands/GONSTER.png`, alt: 'Gonster beer label.' },
    { src: `${assetPath}Brands/HEIMLICH.png`, alt: 'Heimlich beer label.' },
    { src: `${assetPath}Brands/HUFFBEER.png`, alt: 'Huff Beer label.' },
    { src: `${assetPath}Brands/NOCAP.png`, alt: 'No Cap beer label.' },
    { src: `${assetPath}Brands/RADHOPS.png`, alt: 'Radhops beer label.' },
    {
        src: `${assetPath}Brands/SASKIAZEELAND.png`,
        alt: 'Saskia Zeeland beer label.',
    },
    { src: `${assetPath}Brands/SYNTHALE.png`, alt: 'Synthale beer label.' },
    { src: `${assetPath}Brands/THEONEBEER.png`, alt: 'The One Beer label.' },
    { src: `${assetPath}Brands/VIGOR.png`, alt: 'Vigor beer label.' },
];

const TUTORIAL_IMAGES = [
    {
        src: `${assetPath}Tutorial/TUT_01.png`,
        alt: 'Tutorial screen — controls and basic mechanics.',
    },
    {
        src: `${assetPath}Tutorial/TUT_02.png`,
        alt: 'Tutorial screen — crate collection instructions.',
    },
    {
        src: `${assetPath}Tutorial/TUT_03.png`,
        alt: 'Tutorial screen — bottle and cap details.',
    },
    {
        src: `${assetPath}Tutorial/TUT_04.png`,
        alt: 'Tutorial screen — collection overview.',
    },
];

const CHANNEL_IMAGES = [
    {
        src: `${assetPath}Channels/DOOMED.png`,
        alt: 'DOOMED TV channel screen.',
    },
    {
        src: `${assetPath}Channels/TEST.png`,
        alt: 'Test pattern TV channel screen.',
    },
    {
        src: `${assetPath}Channels/STATIC.png`,
        alt: 'Static TV channel screen.',
    },
    {
        src: `${assetPath}Channels/STATIC2.png`,
        alt: 'Second static TV channel screen.',
    },
];

export default function Ld58() {
    return (
        <>
            {/* ── INTRO ── */}

            <CaseIntro
                src={`${assetPath}Marketing/MARKET_Wallpaper.png`}
                kicker="LUDUM DARE 58 / 2025"
                heading="A cap-collecting game in a bachelor pad, made in 72 hours."
                subtitle="Artist and co-designer, with Cyril Ojoga as developer."
            />

            {/* ── CONTEXT ── */}

            <StatementBlock label="CONTEXT">
                <h2>Ludum Dare 58: collection</h2>
                <ScrollReveal>
                    Ludum Dare is a game jam; the theme for edition 58 was collection. I made DDD (Day Drinking Day): Thanks to the Power of Day
                    Drinking I've Achieved God-Tier Cap Collection with Cyril Ojoga in Unity, in 72 hours. I was the artist, he was the developer, and
                    we designed it together. The player opens a beer, collects the cap and throws the bottle.
                </ScrollReveal>
            </StatementBlock>

            <EvidenceRow
                items={[
                    { label: 'ROLE', value: 'Art, sound, co-design' },
                    { label: 'TEAM', value: 'Cyril Ojoga and me' },
                    { label: 'DURATION', value: '72 hours' },
                    { label: 'OUTPUT', value: 'WebGL game in Unity' },
                ]}
            />

            {/* ── ENVIRONMENT ── */}

            <WorkHeader
                title="THE PAD"
                subtitle="001:::ENVIRONMENT"
                description="I modelled everything in the game: the bachelor pad of a single guy who owns the bare minimum."
            />

            <StatementBlock label="DECISION">
                <h2>Realistic, within WebGL</h2>
                <ScrollReveal>
                    I aimed for as realistic as possible within the limits of WebGL. A sparse bachelor pad fit the day-drinking theme. We built for
                    WebGL because more people play browser games during game jams.
                </ScrollReveal>
            </StatementBlock>

            <FullImage
                src={`${assetPath}Environment/ENV_Chair.png`}
                alt="An interior view of the bachelor pad — armchair, clutter, and warm lighting."
            />

            <ComparisonBlock
                label="CONSTRUCTION"
                heading="Armchair, wireframe and render"
                items={[
                    {
                        caption: 'WIREFRAME',
                        src: `${assetPath}Environment/ENV_Chair_WireFrame.png`,
                        alt: 'Wireframe render of the armchair environment.',
                    },
                    {
                        caption: 'FINAL RENDER',
                        src: `${assetPath}Environment/ENV_Chair.png`,
                        alt: 'Final rendered armchair environment with lighting.',
                    },
                ]}
            />

            <ComparisonBlock
                label="THE TV CORNER"
                heading="TV corner, wireframe and render"
                items={[
                    {
                        caption: 'WIREFRAME',
                        src: `${assetPath}Environment/ENV_TV_WireFrame.png`,
                        alt: 'Wireframe render of the TV setup.',
                    },
                    {
                        caption: 'FINAL RENDER',
                        src: `${assetPath}Environment/ENV_TV.png`,
                        alt: 'Final rendered TV corner with glowing screen.',
                    },
                ]}
            />

            {/* ── TELEVISION ── */}

            <WorkHeader
                title="TELEVISION"
                subtitle="002:::GAME_DESIGN"
                description="Apart from throwing bottles, the TV is the main source of entertainment. It shows the tutorial, random videos and other effects."
            />

            <StatementBlock label="APPROACH">
                <h2>Bonk to switch channels</h2>
                <ScrollReveal>
                    When a bottle hits the TV, it gets bonked and switches channels. The tutorials are some of those channels.
                </ScrollReveal>
            </StatementBlock>

            <StatementBlock label="DECISION">
                <h2>A tutorial on TV</h2>
                <ScrollReveal>The tutorial is inspired by BioShock, where a TV shows the player what to do to play the game.</ScrollReveal>
            </StatementBlock>

            <ImageGrid images={TUTORIAL_IMAGES} columns={2} label="TUTORIAL" heading="Tutorial channels" />

            <ImageGrid images={CHANNEL_IMAGES} columns={2} label="CHANNELS" heading="Other channels" />

            {/* ── BRANDING ── */}

            <WorkHeader
                title="BRAND"
                subtitle="003:::IDENTITY"
                description="The logo, logotype and thumbnail for the game, and sixteen knock-off beer labels for the bottles."
            />

            <DoubleImage
                images={[
                    {
                        src: `${assetPath}Marketing/MARKET_Logo.png`,
                        alt: 'Logo design for the LD58 game jam entry.',
                    },
                    {
                        src: `${assetPath}Marketing/MARKET_Thumbnail.png`,
                        alt: 'Thumbnail for the LD58 game jam entry.',
                    },
                ]}
            />

            <FeatureSplit src={`${assetPath}Marketing/MARKET_Logotype.png`} alt="Logotype design for the LD58 entry." reverse label="LOGOTYPE">
                <h3>The DDD logotype</h3>
                <ScrollReveal>Used on the promotional material and the in-game screens.</ScrollReveal>
            </FeatureSplit>

            <StatementBlock label="DECISION">
                <h2>Knock-off brands</h2>
                <ScrollReveal>
                    Real beer brands were not an option because of copyright, and knock-offs sold the game's universe better. The sixteen labels are
                    the part of this project I am most proud of.
                </ScrollReveal>
            </StatementBlock>

            <ImageGrid images={BRAND_IMAGES} columns={4} label="BEER LABELS" heading="Sixteen beer labels" />

            {/* ── AUDIO ── */}

            <WorkHeader title="AUDIO" subtitle="004:::SOUND" description="I made all sound effects in FL Studio." />

            {/* ── CLOSING ── */}

            <HeroStatement label="OUTCOME">
                <h2>Results and hindsight</h2>
                <ScrollReveal>
                    The game ranked 326th overall, with a 3.6 average from 27 ratings. Its best category was Humor, at 82nd. Players liked switching
                    channels with bottles; one wrote, "Finding out you could switch channels with the bottles was fun!" The most common criticism was
                    the missing drinking animation. Others found switching between E and the left mouse button confusing, and missed music and being
                    able to walk around the room. Next time I would outsource some of the artwork and spend more time on animation and game feel.
                </ScrollReveal>
            </HeroStatement>

            <EvidenceRow
                items={[
                    { label: 'OVERALL', value: '326th, 3.6 / 5' },
                    { label: 'HUMOR', value: '82nd, 3.92 / 5' },
                    { label: 'THEME', value: '222nd, 3.94 / 5' },
                    { label: 'TOOLS', value: 'Unity, Blender, Figma, FL Studio' },
                ]}
            />
        </>
    );
}
