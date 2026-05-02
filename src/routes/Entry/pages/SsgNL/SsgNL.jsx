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

import { Data } from './ssgnl.data';

const assetPath = '/img/work/ssgnl/';

export default function SsgNL() {
    return (
        <>
            {/* ── INTRO ── */}

            <CaseIntro
                src={`${assetPath}autoq/MAIN.mp4`}
                kicker={`SOPRA STERIA / ${Data.year}`}
                heading="Four products. No templates. No repeats."
                subtitle="Design, development, and game design at Sopra Steria."
            />

            {/* ── ROLE ── */}

            <StatementBlock label="ROLE">
                <h2>Every product needed everything from scratch.</h2>
                <ScrollReveal>
                    Brand systems, educational board games, conversational interfaces. Each project demanded a different discipline but the same
                    standard — clear design that earns attention from both engineers and executives.
                </ScrollReveal>
            </StatementBlock>

            <EvidenceRow
                items={[
                    { label: 'SCOPE', value: '4 internal products' },
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
                description="A board game that turns cybersecurity awareness into strategic play. Players roll dice to move, then draw cards that test their knowledge across five domains — C.Y.B.E.R.: Crisis Management, Yield Protection, Breach Readiness, Enterprise Governance, and Resilience Operations. Higher levels mean harder questions. I designed the full visual identity — board layout, card systems, rulebook, and 3D renders for internal promotion."
            />

            <FullImage src={`${assetPath}cybersec/CyberSec_Render.png`} alt="3D render of the Cybersecurity board game." />

            <FeatureSplit src={`${assetPath}cybersec/CyberSec_Board.png`} alt="Board layout for the Cybersecurity game." label="BOARD DESIGN">
                <h3>Five domains. One board.</h3>
                <ScrollReveal>
                    Each card tests a specific aspect of cybersecurity — from crisis response to enterprise governance. The difficulty scales with the
                    player's level: basic awareness at the start, detailed technical answers by the end.
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
                description="A second board game — same medium, completely different system. Players invest tokens to grow their organisation's agile maturity across five PLATO domains: Portfolio Management, Leadership, AI & Data, Team & Employees, and Organisation Design. A game leader from Sopra Steria oversees each session. I designed the board, cards, rulebook, and scoring mechanics — visually distinct from the cybersecurity game but within the same brand framework."
            />

            <DoubleImage
                images={[
                    { src: `${assetPath}agilegame/BOARD.png`, alt: 'Board layout for the Agile Maturity game.' },
                    { src: `${assetPath}agilegame/QUESTION CARDS.png`, alt: 'Question cards for the Agile Maturity game.' },
                ]}
            />

            <FeatureSplit src={`${assetPath}agilegame/PLATO CARD.png`} alt="PLATO situation card for the Agile Maturity game." label="CARD SYSTEM">
                <h3>Situation cards, question cards, and a token economy.</h3>
                <ScrollReveal>
                    PLATO situation cards describe an event — players guess which domain it belongs to. Question cards test knowledge directly.
                    Correct answers earn tokens to invest in the Skill Board. The game ends on time, and the final score reflects how well players
                    balanced investment across all five domains.
                </ScrollReveal>
            </FeatureSplit>

            <DoubleImage
                images={[
                    { src: `${assetPath}agilegame/SCORECARD.png`, alt: 'Scorecard front for the Agile Maturity game.' },
                    { src: `${assetPath}agilegame/SCORECARD_BACK.png`, alt: 'Scorecard back for the Agile Maturity game.' },
                ]}
            />

            <ComparisonBlock
                label="EVENT CARDS"
                heading="Front and back of every card type."
                items={[
                    { caption: 'FRONT', src: `${assetPath}agilegame/AFTERHITWORK.png`, alt: 'Front of the After Hit Work event card.' },
                    { caption: 'BACK', src: `${assetPath}agilegame/AFTERHITWORK_BACK.png`, alt: 'Back of the After Hit Work event card.' },
                ]}
            />

            <DoubleImage
                images={[
                    { src: `${assetPath}agilegame/GLOBAL EVENT CARD.png`, alt: 'Global event card for the Agile Maturity game.' },
                    { src: `${assetPath}agilegame/RULEBOOK.png`, alt: 'Rulebook front cover for the Agile Maturity game.' },
                ]}
            />

            {/* ── CHATBOT ── */}

            <WorkHeader
                title="CHATBOT"
                subtitle="004:::CONVERSATIONAL_UI"
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
                <h2>Four products. Four systems. Zero shortcuts.</h2>
                <ScrollReveal>
                    Corporate training, cybersecurity awareness, agile methodology, and knowledge management — each product built for its audience,
                    each visually distinct. The board games are in active use at the office, and the marketing materials shipped on LinkedIn.
                </ScrollReveal>
            </HeroStatement>

            <EvidenceRow
                items={[
                    { label: 'PRODUCTS', value: 'Auto|Q, CyberSec, Agile, Chatbot' },
                    { label: 'DISCIPLINES', value: 'UX, Game Design, Branding' },
                    { label: 'IMPLEMENTATION', value: 'Figma, Blender, Print' },
                ]}
            />
        </>
    );
}
