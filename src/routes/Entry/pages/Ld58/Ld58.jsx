import ScrollReveal from '@components/effects/ScrollReveal';
import CaseIntro from '@components/ui/CaseIntro/CaseIntro';
import DoubleImage from '@components/ui/DoubleImage/DoubleImage';
import EvidenceRow from '@components/ui/EvidenceRow/EvidenceRow';
import FeatureSplit from '@components/ui/FeatureSplit/FeatureSplit';
import FullImage from '@components/ui/FullImage/FullImage';
import HeroStatement from '@components/ui/HeroStatement/HeroStatement';
import StatementBlock from '@components/ui/StatementBlock/StatementBlock';
import WorkHeader from '@components/ui/WorkHeader/WorkHeader';

import { Data } from './ld58.data';

const assetPath = '/img/work/ld58/';

export default function Ld58() {
    return (
        <>
            {/* ── INTRO ── */}

            <CaseIntro
                src={`${assetPath}Wallpaper.png`}
                kicker={`LUDUM DARE / ${Data.year}`}
                heading="72 hours to build a world worth cracking open."
                subtitle="3D artist and UI designer for a 72-hour game jam."
            />

            {/* ── ROLE ── */}

            <StatementBlock label="ROLE">
                <h2>Every surface, every label, every pixel — in three days.</h2>
                <ScrollReveal>
                    The full visual layer for a satirical cap-collecting simulator. Hand-modeled interiors, in-game UI, and a brand identity that
                    sells the bit — all under the Ludum Dare 58 clock.
                </ScrollReveal>
            </StatementBlock>

            <EvidenceRow
                items={[
                    { label: 'EVENT', value: 'Ludum Dare 58' },
                    { label: 'DURATION', value: '72 hours' },
                    { label: 'ROLE', value: '3D Art, UI Design' },
                    { label: 'TOOLS', value: 'Unity, Blender, Figma' },
                ]}
            />

            {/* ── ENVIRONMENT ── */}

            <WorkHeader
                title="THE PAD"
                subtitle="001:::ENVIRONMENT"
                description="A bachelor pad built to feel lived-in. Every prop placed to tell a story of convenience and zero ambition. Warm 80s palette. Intentional mess. The kind of room you'd never leave — and that's the point."
            />

            <FullImage src={`${assetPath}Styleframe.png`} alt="An 80s inspired interior of a bachelor with one goal in mind: collecting." />

            <FullImage src={`${assetPath}Styleframe2.png`} alt="Another angle of the bachelor pad interior." thin />

            {/* ── TELEVISION ── */}

            <WorkHeader
                title="TELEVISION"
                subtitle="002:::GAME_DESIGN"
                description="The centerpiece. A glowing rectangle of escape and distraction. The entire gameplay loop orbits around it — simple inputs, satisfying feedback, and a collection system designed to keep you reaching for one more cap."
            />

            <FeatureSplit src={`${assetPath}Controls.png`} alt="Game control scheme for cap collecting mechanics." label="CONTROLS">
                <h3>One input. Maximum satisfaction.</h3>
                <ScrollReveal>
                    Every cap pop tuned for tactile feedback — snap animations, juice, and a collection loop that keeps the dopamine flowing. Simple
                    to learn. Impossible to put down.
                </ScrollReveal>
            </FeatureSplit>

            {/* ── BRANDING ── */}

            <WorkHeader
                title="BRAND"
                subtitle="003:::IDENTITY"
                description="Every jam game needs an identity that sells the joke instantly. Retro beer culture meets ironic self-help — a logo, logotype, and thumbnail that tell the story before you've read a word."
            />

            <DoubleImage
                images={[
                    { src: `${assetPath}LOGO.png`, alt: 'Logo design for the LD58 game jam entry.' },
                    { src: `${assetPath}Thumbnail.png`, alt: 'Thumbnail for the LD58 game jam entry.' },
                ]}
            />

            <FeatureSplit src={`${assetPath}Logotype.png`} alt="Logotype design for the LD58 entry." reverse label="LOGOTYPE">
                <h3>Type that sells the premise at a glance.</h3>
                <ScrollReveal>
                    Bold, unapologetic, slightly absurd. Designed to carry the tone across promotional material and in-game screens.
                </ScrollReveal>
            </FeatureSplit>

            {/* ── PROPS ── */}

            <DoubleImage
                images={[
                    { src: `${assetPath}CAP Bottle.png`, alt: 'Cap and bottle 3D model.' },
                    { src: `${assetPath}BOTTLE Pile.png`, alt: 'Pile of bottles 3D render.' },
                ]}
            />

            {/* ── CLOSING ── */}

            <HeroStatement label="OUTCOME">
                <h2>Built in 72 hours. Plays like it wasn't.</h2>
                <ScrollReveal>
                    Handcrafted 3D environments, polished UI, cohesive branding, original audio, and a gameplay loop that makes cap collecting
                    genuinely satisfying — all delivered within a single weekend.
                </ScrollReveal>
            </HeroStatement>

            <EvidenceRow
                items={[
                    { label: '3D SCENES', value: 'Full interior environment' },
                    { label: 'BRAND', value: 'Logo, logotype, thumbnail' },
                    { label: 'UI', value: 'In-game HUD and menus' },
                ]}
            />
        </>
    );
}
