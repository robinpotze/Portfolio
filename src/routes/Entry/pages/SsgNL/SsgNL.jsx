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

const assetPath = '/img/work/ssgnl/';

export default function SsgNL() {
    return (
        <>
            {/* ── INTRO ── */}

            <CaseIntro
                src={`${assetPath}autoq/MAIN.mp4`}
                kicker="SOPRA STERIA / 2024"
                heading="Designing across disciplines at enterprise scale."
                subtitle="UX designer, full-stack developer, and game designer."
            />

            {/* ── ROLE ── */}

            <StatementBlock label="ROLE">
                <h2>Designer and developer across five internal products.</h2>
                <ScrollReveal>
                    At Sopra Steria, I wore multiple hats — designing brand identities, building educational board games, developing chatbot
                    interfaces, and crafting interactive learning tools. Each project required a different skillset but shared the same goal: making
                    complex corporate content engaging.
                </ScrollReveal>
            </StatementBlock>

            <EvidenceRow
                items={[
                    { label: 'SCOPE', value: '5 internal products' },
                    { label: 'DURATION', value: '12 months' },
                    { label: 'ROLE', value: 'UX Design, Dev, Game Design' },
                    { label: 'OUTPUT', value: 'Games, branding, interfaces' },
                ]}
            />

            {/* ── AUTO|Q ── */}

            <WorkHeader
                title="AUTO|Q"
                subtitle="BRANDING:::MARKETING"
                description="The Test Automation department needed a visual identity that could communicate technical expertise without alienating non-technical stakeholders. I designed the brand system and produced all marketing material."
            />

            <DoubleImage
                images={[
                    { src: `${assetPath}autoq/FAST-low.png`, alt: 'FAST training module card design for Auto|Q.' },
                    { src: `${assetPath}autoq/Achterkant.png`, alt: 'Back of Auto|Q training card.' },
                ]}
            />

            <DoubleImage
                images={[
                    { src: `${assetPath}autoq/TMMi-low.png`, alt: 'TMMi training module card design.' },
                    { src: `${assetPath}autoq/Trainingen-low.png`, alt: 'Training overview card design.' },
                ]}
            />

            {/* ── CYBERSECURITY ── */}

            <WorkHeader
                title="CYBERSECURITY"
                subtitle="EDUCATION:::BOARD_GAME"
                description="The Sopra Steria Cybersecurity board game translates complex security concepts into strategic gameplay. I designed the full visual identity — board layout, card systems, rulebook, and 3D renders for promotional material."
            />

            <FullImage src={`${assetPath}cybersec/CyberSec_Render.png`} alt="3D render of the Cybersecurity board game." />

            <FeatureSplit
                src={`${assetPath}cybersec/CyberSec_Board.png`}
                alt="Board layout for the Cybersecurity game."
                label="BOARD DESIGN"
            >
                <h3>Strategic layout for security scenarios.</h3>
                <ScrollReveal>
                    The board design maps cybersecurity attack vectors and defense strategies into a spatial game mechanic — players navigate
                    threats and build defenses across interconnected nodes.
                </ScrollReveal>
            </FeatureSplit>

            <DoubleImage
                images={[
                    { src: `${assetPath}cybersec/CyberSec_Rulebook.png`, alt: 'Rulebook design for the Cybersecurity game.' },
                    { src: `${assetPath}cybersec/CyberSec_SkillCard.png`, alt: 'Skill card design for the Cybersecurity game.' },
                ]}
            />

            <FullImage src={`${assetPath}cybersec/CyberSec_Render_Top.png`} alt="Top-down render of the Cybersecurity board game." thin />

            {/* ── AGILE GAME ── */}

            <WorkHeader
                title="AGILE MATURITY"
                subtitle="EDUCATION:::BOARD_GAME"
                description="A board game designed to teach agile methodology through competitive play. I designed the complete game system — board, cards, rulebook, and scoring mechanics — all within Sopra Steria's brand framework."
            />

            <DoubleImage
                images={[
                    { src: `${assetPath}agilegame/BOARD.png`, alt: 'Board layout for the Agile Maturity game.' },
                    { src: `${assetPath}agilegame/QUESTION CARDS.png`, alt: 'Question cards for the Agile Maturity game.' },
                ]}
            />

            <ComparisonBlock
                label="CARD SYSTEM"
                heading="Front and back of every card type."
                items={[
                    { caption: 'FRONT', src: `${assetPath}agilegame/AFTERHITWORK.png`, alt: 'Front of the After Hit Work event card.' },
                    { caption: 'BACK', src: `${assetPath}agilegame/AFTERHITWORK_BACK.png`, alt: 'Back of the After Hit Work event card.' },
                ]}
            />

            <DoubleImage
                images={[
                    { src: `${assetPath}agilegame/SCORECARD.png`, alt: 'Scorecard front for the Agile Maturity game.' },
                    { src: `${assetPath}agilegame/SCORECARD_BACK.png`, alt: 'Scorecard back for the Agile Maturity game.' },
                ]}
            />

            {/* ── SQL GAME ── */}

            <WorkHeader
                title="SQL QUEST"
                subtitle="EDUCATION:::INTERACTIVE_GAME"
                description="An interactive game that teaches SQL through exploration and puzzle-solving. I designed the full interface — from the query tool and inventory system to the world map and level progression."
            />

            <FullImage src={`${assetPath}sqlgame/Interactive.png`} alt="Interactive SQL game interface." />

            <FeatureSplit src={`${assetPath}sqlgame/QueryTool.png`} alt="SQL query tool interface." label="QUERY TOOL">
                <h3>Learning SQL by writing real queries.</h3>
                <ScrollReveal>
                    The query tool provides a sandbox where players write actual SQL statements to progress — with immediate visual feedback that
                    makes abstract database concepts tangible.
                </ScrollReveal>
            </FeatureSplit>

            <DoubleImage
                images={[
                    { src: `${assetPath}sqlgame/Current=Map.png`, alt: 'World map interface for the SQL game.' },
                    { src: `${assetPath}sqlgame/Current=Inventory.png`, alt: 'Inventory system for the SQL game.' },
                ]}
            />

            <ComparisonBlock
                label="ITERATION"
                heading="From early wireframes to polished interface."
                items={[
                    { caption: 'EARLY VERSION', src: `${assetPath}sqlgame/Versie 0.png`, alt: 'Early wireframe of the SQL game.' },
                    { caption: 'FINAL VERSION', src: `${assetPath}sqlgame/Versie 3.0.png`, alt: 'Final polished version of the SQL game.' },
                ]}
            />

            {/* ── CHATBOT ── */}

            <WorkHeader
                title="CHATBOT"
                subtitle="UX:::CONVERSATIONAL_UI"
                description="A conversational interface designed for internal knowledge management. I designed both light and dark variants, focusing on readability, response formatting, and natural conversation flow."
            />

            <ComparisonBlock
                label="THEME"
                heading="Light and dark for every context."
                items={[
                    { caption: 'DARK MODE', src: `${assetPath}chatbot/V1_Dark.png`, alt: 'Chatbot interface in dark mode.' },
                    { caption: 'LIGHT MODE', src: `${assetPath}chatbot/V1_Light.png`, alt: 'Chatbot interface in light mode.' },
                ]}
            />

            {/* ── CLOSING ── */}

            <HeroStatement label="OUTCOME">
                <h2>Five products, multiple design systems, zero templates.</h2>
                <ScrollReveal>
                    A portfolio of internal tools and games that made corporate training, cybersecurity awareness, and agile methodology engaging —
                    each product purpose-built for its audience while sharing a cohesive visual foundation.
                </ScrollReveal>
            </HeroStatement>

            <EvidenceRow
                items={[
                    { label: 'PRODUCTS', value: 'Auto|Q, CyberSec, Agile, SQL, Chatbot' },
                    { label: 'DISCIPLINES', value: 'UX, Game Design, Branding' },
                    { label: 'IMPLEMENTATION', value: 'React, Unity, Print' },
                ]}
            />
        </>
    );
}
