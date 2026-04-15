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

import { Data } from './SsgNL.data';

const assetPath = '/img/work/ssgnl/';

export default function SsgNL() {
    return (
        <>
            {/* ── INTRO ── */}

            <CaseIntro
                src={`${assetPath}autoq/MAIN.mp4`}
                kicker={`SOPRA STERIA / ${Data.year}`}
                heading="Five products. No templates. No repeats."
                subtitle="Design, development, and game design at Sopra Steria."
            />

            {/* ── ROLE ── */}

            <StatementBlock label="ROLE">
                <h2>Every product needed everything from scratch.</h2>
                <ScrollReveal>
                    Brand systems, educational board games, conversational interfaces, interactive learning tools. Each project demanded a different
                    discipline but the same standard — make complex corporate content impossible to ignore.
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
                subtitle="001:::BRANDING"
                description="Test Automation needed an identity that could speak to engineers and executives in the same breath. I built the brand system from zero and produced every piece of marketing material the department shipped."
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
                subtitle="002:::BOARD_GAME"
                description="A board game that turns cybersecurity concepts into strategic decisions. Full visual identity — board layout, card systems, rulebook, and 3D renders for internal promotion. Every element designed to make security training something people actually want to do."
            />

            <FullImage src={`${assetPath}cybersec/CyberSec_Render.png`} alt="3D render of the Cybersecurity board game." />

            <FeatureSplit src={`${assetPath}cybersec/CyberSec_Board.png`} alt="Board layout for the Cybersecurity game." label="BOARD DESIGN">
                <h3>Attack vectors as game mechanics.</h3>
                <ScrollReveal>
                    The board maps real cybersecurity threats into spatial strategy — players navigate attack vectors and build defenses across
                    interconnected nodes. The learning happens without anyone noticing.
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
                subtitle="003:::BOARD_GAME"
                description="A second board game — same medium, completely different system. Agile methodology turned into competitive play. Board, cards, rulebook, and scoring mechanics, all within Sopra Steria's brand framework but visually distinct from the cybersecurity game."
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
                subtitle="004:::INTERACTIVE_GAME"
                description="An interactive game that teaches SQL through exploration. Players write real queries to progress. I designed every screen — query tool, inventory system, world map, and level progression."
            />

            <FullImage src={`${assetPath}sqlgame/Interactive.png`} alt="Interactive SQL game interface." />

            <FeatureSplit src={`${assetPath}sqlgame/QueryTool.png`} alt="SQL query tool interface." label="QUERY TOOL">
                <h3>Real queries. Real feedback. Real learning.</h3>
                <ScrollReveal>
                    A sandbox where players write actual SQL statements and see immediate visual results. Abstract database concepts become tangible
                    the moment the query runs.
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
                heading="Stripped down, then built back up."
                items={[
                    { caption: 'EARLY VERSION', src: `${assetPath}sqlgame/Versie 0.png`, alt: 'Early wireframe of the SQL game.' },
                    { caption: 'FINAL VERSION', src: `${assetPath}sqlgame/Versie 3.0.png`, alt: 'Final polished version of the SQL game.' },
                ]}
            />

            {/* ── CHATBOT ── */}

            <WorkHeader
                title="CHATBOT"
                subtitle="005:::CONVERSATIONAL_UI"
                description="A conversational interface for internal knowledge management. Light and dark variants designed around readability, response formatting, and the rhythm of natural conversation. Clean enough to disappear. Structured enough to be useful."
            />

            <ComparisonBlock
                label="THEME"
                heading="Two modes. Same clarity."
                items={[
                    { caption: 'DARK MODE', src: `${assetPath}chatbot/V1_Dark.png`, alt: 'Chatbot interface in dark mode.' },
                    { caption: 'LIGHT MODE', src: `${assetPath}chatbot/V1_Light.png`, alt: 'Chatbot interface in light mode.' },
                ]}
            />

            {/* ── CLOSING ── */}

            <HeroStatement label="OUTCOME">
                <h2>Five products. Five systems. Zero shortcuts.</h2>
                <ScrollReveal>
                    Corporate training, cybersecurity awareness, agile methodology, SQL education, and knowledge management — each product built for
                    its audience, each visually distinct, all sharing the same uncompromising design standard.
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
