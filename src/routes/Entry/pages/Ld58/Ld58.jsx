import ScrollReveal from '@components/effects/ScrollReveal';
import CaseIntro from '@components/ui/CaseIntro/CaseIntro';
import DoubleImage from '@components/ui/DoubleImage/DoubleImage';
import EvidenceRow from '@components/ui/EvidenceRow/EvidenceRow';
import FeatureSplit from '@components/ui/FeatureSplit/FeatureSplit';
import FullImage from '@components/ui/FullImage/FullImage';
import HeroStatement from '@components/ui/HeroStatement/HeroStatement';
import StatementBlock from '@components/ui/StatementBlock/StatementBlock';
import WorkHeader from '@components/ui/WorkHeader/WorkHeader';

const assetPath = '/img/work/ld58/';

export default function Ld58() {
    return (
        <>
            {/* ── INTRO ── */}

            <CaseIntro
                src={`${assetPath}Wallpaper.png`}
                kicker="LUDUM DARE / 2025"
                heading="Cap-collecting meets couch culture."
                subtitle="3D artist and UI designer for a 72-hour game jam."
            />

            {/* ── ROLE ── */}

            <StatementBlock label="ROLE">
                <h2>3D environments, UI design, and brand identity in 72 hours.</h2>
                <ScrollReveal>
                    Built the entire visual layer for a satirical day-drinking simulator — from hand-crafted interiors and brand assets to in-game
                    UI — all within the Ludum Dare 58 time constraint.
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
                subtitle="ENVIRONMENT:::STYLE_FRAMES"
                description="The bachelor pad needed to feel lived-in — a cluttered shrine to convenience and consumption. Every object tells a story of peak relaxation and zero ambition, rendered in a warm 80s palette that makes the mess feel intentional."
            />

            <FullImage src={`${assetPath}Styleframe.png`} alt="An 80s inspired interior of a bachelor with one goal in mind: collecting." />

            <FullImage src={`${assetPath}Styleframe2.png`} alt="Another angle of the bachelor pad interior." thin />

            {/* ── TELEVISION ── */}

            <WorkHeader
                title="TELEVISION"
                subtitle="SALVATION:::CONSUMPTION"
                description="The TV was the centerpiece of the bachelor pad, a glowing rectangle that promised escape and entertainment. Filled with content to distract the modern man from the crushing weight of his own existence, the television was both a blessing and a curse."
            />

            <FeatureSplit src={`${assetPath}Controls.png`} alt="Game control scheme for cap collecting mechanics." label="CONTROLS">
                <h3>Satisfying mechanics, simple inputs.</h3>
                <ScrollReveal>
                    The interaction design focused on making every cap pop feel rewarding — tactile feedback, juicy animations, and a progression
                    system that keeps the dopamine flowing.
                </ScrollReveal>
            </FeatureSplit>

            {/* ── BRANDING ── */}

            <WorkHeader
                title="BRAND"
                subtitle="IDENTITY:::PROMOTION"
                description="Every jam game needs an identity that sells the joke. The branding leaned into retro beer culture and ironic self-help aesthetics — a logo, logotype, and thumbnail that tell the whole story at a glance."
            />

            <DoubleImage
                images={[
                    { src: `${assetPath}LOGO.png`, alt: 'Logo design for the LD58 game jam entry.' },
                    { src: `${assetPath}Thumbnail.png`, alt: 'Thumbnail for the LD58 game jam entry.' },
                ]}
            />

            <FeatureSplit src={`${assetPath}Logotype.png`} alt="Logotype design for the LD58 entry." reverse label="LOGOTYPE">
                <h3>Retro-flavored type that sells the premise.</h3>
                <ScrollReveal>
                    The logotype captures the tone of the game — bold, unapologetic, and slightly absurd. Designed to work across promotional
                    material and in-game UI.
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
                <h2>72 hours, one couch, zero regrets.</h2>
                <ScrollReveal>
                    A complete game with handcrafted environments, polished UI, cohesive branding, and a gameplay loop that makes cap collecting
                    feel like an achievement — delivered under the pressure of a 72-hour jam.
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
