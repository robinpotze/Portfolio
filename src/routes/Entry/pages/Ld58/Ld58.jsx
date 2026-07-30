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

import { Data } from './ld58.data';

const assetPath = '/assets/img/work/ld58/';

const BRAND_IMAGES = [
    { src: `${assetPath}Brands/9_WONDER.png`, alt: '9 Wonder beer label.' },
    { src: `${assetPath}Brands/ATOMBREW.png`, alt: 'Atombrew beer label.' },
    { src: `${assetPath}Brands/BEPIS.png`, alt: 'Bepis beer label.' },
    { src: `${assetPath}Brands/BIGBESTIE.png`, alt: 'Big Bestie beer label.' },
    { src: `${assetPath}Brands/BOMBOCLART.png`, alt: 'Bomboclart beer label.' },
    { src: `${assetPath}Brands/CLANKERGREASE.png`, alt: 'Clankergrease beer label.' },
    { src: `${assetPath}Brands/CYKACOLA.png`, alt: 'Cyka Cola beer label.' },
    { src: `${assetPath}Brands/GONSTER.png`, alt: 'Gonster beer label.' },
    { src: `${assetPath}Brands/HEIMLICH.png`, alt: 'Heimlich beer label.' },
    { src: `${assetPath}Brands/HUFFBEER.png`, alt: 'Huff Beer label.' },
    { src: `${assetPath}Brands/NOCAP.png`, alt: 'No Cap beer label.' },
    { src: `${assetPath}Brands/RADHOPS.png`, alt: 'Radhops beer label.' },
    { src: `${assetPath}Brands/SASKIAZEELAND.png`, alt: 'Saskia Zeeland beer label.' },
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
    { src: `${assetPath}Tutorial/TUT_03.png`, alt: 'Tutorial screen — bottle and cap details.' },
    { src: `${assetPath}Tutorial/TUT_04.png`, alt: 'Tutorial screen — collection overview.' },
];

const CHANNEL_IMAGES = [
    { src: `${assetPath}Channels/DOOMED.png`, alt: 'DOOMED TV channel screen.' },
    { src: `${assetPath}Channels/TEST.png`, alt: 'Test pattern TV channel screen.' },
    { src: `${assetPath}Channels/STATIC.png`, alt: 'Static TV channel screen.' },
    { src: `${assetPath}Channels/STATIC2.png`, alt: 'Second static TV channel screen.' },
];

export default function Ld58() {
    return (
        <>
            {/* ── INTRO ── */}

            <CaseIntro
                src={`${assetPath}Marketing/MARKET_Wallpaper.png`}
                kicker={`LUDUM DARE / ${Data.year}`}
                heading="72 hours to build a world worth cracking open."
                subtitle="3D environments, branding, TV content, and audio for a satirical cap-collecting simulator."
            />

            {/* ── ROLE ── */}

            <StatementBlock label="ROLE">
                <h2>Every surface, every label, every pixel — in three days.</h2>
                <ScrollReveal>
                    The full visual layer for a satirical cap-collecting simulator. Hand-modeled interiors, sixteen knock-off beer brands, animated TV
                    channels, tutorial graphics, and a cohesive brand identity — all under the Ludum Dare 58 clock.
                </ScrollReveal>
            </StatementBlock>

            <EvidenceRow
                items={[
                    { label: 'EVENT', value: 'Ludum Dare 58' },
                    { label: 'DURATION', value: '72 hours' },
                    { label: 'ROLE', value: '3D Art, UI, Branding, Audio' },
                    { label: 'TOOLS', value: 'Unity, Blender, Figma' },
                ]}
            />

            {/* ── ENVIRONMENT ── */}

            <WorkHeader
                title="THE PAD"
                subtitle="001:::ENVIRONMENT"
                description="A bachelor pad built to feel lived-in. Every prop placed to tell a story of convenience and zero ambition. Warm palette. Intentional mess. The kind of room you'd never leave — and that's the point."
            />

            <FullImage
                src={`${assetPath}Environment/ENV_Chair.png`}
                alt="An interior view of the bachelor pad — armchair, clutter, and warm lighting."
            />

            <ComparisonBlock
                label="CONSTRUCTION"
                heading="From wireframe to final render."
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
                heading="Every surface modeled. Every screen functional."
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
                description="The centerpiece. A glowing rectangle of escape and distraction. The entire gameplay loop orbits around it — simple inputs, satisfying feedback, and a collection system designed to keep you reaching for one more cap."
            />

            <ImageGrid images={TUTORIAL_IMAGES} columns={2} label="TUTORIAL" heading="Teaches without interrupting." />

            <ImageGrid images={CHANNEL_IMAGES} columns={2} label="CHANNELS" heading="So many channels. None of them helpful." />

            {/* ── BRANDING ── */}

            <WorkHeader
                title="BRAND"
                subtitle="003:::IDENTITY"
                description="Every jam game needs an identity that sells the joke instantly. Retro beer culture meets ironic self-awareness — a logo, logotype, and thumbnail that tell the story before you've read a word."
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
                <h3>Type that sells the premise at a glance.</h3>
                <ScrollReveal>
                    Bold, unapologetic, slightly absurd. Designed to carry the tone across promotional material and in-game screens.
                </ScrollReveal>
            </FeatureSplit>

            <ImageGrid images={BRAND_IMAGES} columns={4} label="BEER LABELS" heading="Sixteen knock-off brands. All fictional. Mostly drinkable." />

            {/* ── CLOSING ── */}

            <HeroStatement label="OUTCOME">
                <h2>Built in 72 hours. Plays like it wasn't.</h2>
                <ScrollReveal>
                    Handcrafted 3D environments, sixteen beer brands, four TV channels, polished UI, cohesive branding, original audio, and a gameplay
                    loop that makes cap collecting genuinely satisfying — all delivered within a single weekend.
                </ScrollReveal>
            </HeroStatement>

            <EvidenceRow
                items={[
                    { label: '3D', value: 'Full interior environment' },
                    { label: 'BRANDS', value: '16 beer labels' },
                    { label: 'TV', value: '4 channels + tutorial' },
                    { label: 'IDENTITY', value: 'Logo, logotype, thumbnail' },
                ]}
            />
        </>
    );
}
