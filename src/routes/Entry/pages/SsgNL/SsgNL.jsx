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

const assetPath = '/assets/img/work/ssgnl/';

export default function SsgNL() {
    return (
        <>
            {/* ── INTRO ── */}

            <CaseIntro
                src={`${assetPath}autoq/MAIN.mp4`}
                kicker="SOPRA STERIA / 2025–NOW"
                heading="Brand, board game and interface design at Sopra Steria."
                subtitle="Game, graphic and motion designer, working with different stakeholders per product."
            />

            {/* ── CONTEXT ── */}

            <StatementBlock label="CONTEXT">
                <h2>Four products for Sopra Steria Nederland</h2>
                <ScrollReveal>
                    Since 2025 I have worked as game designer, graphic designer and motion designer on four products, each with its own stakeholders:
                    the AUTO|Q identity, two educational board games, and an HR chatbot.
                </ScrollReveal>
            </StatementBlock>

            <EvidenceRow
                items={[
                    { label: 'ROLE', value: 'Game, graphic and motion design' },
                    { label: 'TEAM', value: 'Different stakeholders per product' },
                    { label: 'DURATION', value: '2025 – ongoing' },
                    { label: 'OUTPUT', value: 'Identity, board games, chatbot UI' },
                ]}
            />

            {/* ── AUTO|Q ── */}

            <WorkHeader
                title="AUTO|Q"
                subtitle="001:::BRANDING"
                description="AUTO|Q is the test automation chapter of Sopra Steria Nederland. Over several projects I delivered its logo, identity and other UI."
            />

            <StatementBlock label="APPROACH">
                <h2>Material for chapter events</h2>
                <ScrollReveal>The briefs differed per project. Most asked for promotional material for the events the chapter runs.</ScrollReveal>
            </StatementBlock>

            <DoubleImage
                images={[
                    {
                        src: `${assetPath}autoq/FAST-low.png`,
                        alt: 'FAST training module card design for Auto|Q.',
                    },
                    {
                        src: `${assetPath}autoq/Achterkant.png`,
                        alt: 'Back of Auto|Q training card.',
                    },
                ]}
            />

            <DoubleImage
                images={[
                    {
                        src: `${assetPath}autoq/TMMi-low.png`,
                        alt: 'TMMi training module card design.',
                    },
                    {
                        src: `${assetPath}autoq/Trainingen-low.png`,
                        alt: 'Training overview card design.',
                    },
                ]}
            />

            {/* ── AGILE GAME ── */}

            <WorkHeader
                title="AGILE MATURITY"
                subtitle="002:::BOARD_GAME"
                description="A board game for events and customer meetings. It teaches players about agile maturity and shows where Sopra Steria's experts can help. It later became the base for the cybersecurity game."
            />

            <DoubleImage
                images={[
                    {
                        src: `${assetPath}agilegame/BOARD.png`,
                        alt: 'Board layout for the Agile Maturity game.',
                    },
                    {
                        src: `${assetPath}agilegame/QUESTION CARDS.png`,
                        alt: 'Question cards for the Agile Maturity game.',
                    },
                ]}
            />

            <FeatureSplit src={`${assetPath}agilegame/PLATO CARD.png`} alt="PLATO situation card for the Agile Maturity game." label="CARD SYSTEM">
                <h3>Questions, tokens and five pillars</h3>
                <ScrollReveal>
                    The game follows the five PLATO pillars: Portfolio Management, Leadership, AI & Data, Team & Employees and Organisation Design.
                    PLATO situation cards describe an event, and players guess which pillar it belongs to. Question cards test knowledge directly and
                    reward tokens when answered correctly. Players invest those tokens in the Skill Board. The game ends on time, and the final score
                    shows how well players balanced their investment across the five pillars. A game leader from Sopra Steria runs each session.
                </ScrollReveal>
            </FeatureSplit>

            <StatementBlock label="DECISION">
                <h2>Tokens per pillar</h2>
                <ScrollReveal>
                    Tokens are earned per pillar, so players see how knowledgeable they are in each one and where they need more help from Sopra
                    Steria's experts.
                </ScrollReveal>
            </StatementBlock>

            <DoubleImage
                images={[
                    {
                        src: `${assetPath}agilegame/SCORECARD.png`,
                        alt: 'Scorecard front for the Agile Maturity game.',
                    },
                    {
                        src: `${assetPath}agilegame/SCORECARD_BACK.png`,
                        alt: 'Scorecard back for the Agile Maturity game.',
                    },
                ]}
            />

            <ComparisonBlock
                label="REFERENCE"
                heading="Level reference, front and back"
                items={[
                    {
                        caption: 'FRONT',
                        src: `${assetPath}agilegame/AFTERHITWORK.png`,
                        alt: 'Front of the level reference card, describing what each level means per pillar.',
                    },
                    {
                        caption: 'BACK',
                        src: `${assetPath}agilegame/AFTERHITWORK_BACK.png`,
                        alt: 'Back of the level reference card.',
                    },
                ]}
            />

            <DoubleImage
                images={[
                    {
                        src: `${assetPath}agilegame/GLOBAL EVENT CARD.png`,
                        alt: 'Global event card for the Agile Maturity game.',
                    },
                    {
                        src: `${assetPath}agilegame/RULEBOOK.png`,
                        alt: 'Rulebook front cover for the Agile Maturity game.',
                    },
                ]}
            />

            {/* ── CYBERSECURITY ── */}

            <WorkHeader
                title="CYBERSECURITY"
                subtitle="003:::BOARD_GAME"
                description="A board game for marketing and education at events and customer meetings. It teaches cybersecurity and shows the added value of Sopra Steria. I designed the board, cards, rulebook and 3D renders."
            />

            <FullImage src={`${assetPath}cybersec/CyberSec_Render.png`} alt="3D render of the Cybersecurity board game." />

            <FeatureSplit src={`${assetPath}cybersec/CyberSec_Board.png`} alt="Board layout for the Cybersecurity game." label="DECISION">
                <h3>Five domains from PLATO</h3>
                <ScrollReveal>
                    I took the five PLATO domains from the agile game and renamed them for cybersecurity as C.Y.B.E.R.: Crisis Management, Yield
                    Protection, Breach Readiness, Enterprise Governance and Resilience Operations. Players roll dice to move and draw cards that test
                    their knowledge per domain; the questions get harder as a player's level rises.
                </ScrollReveal>
            </FeatureSplit>

            <DoubleImage
                images={[
                    {
                        src: `${assetPath}cybersec/CyberSec_Rulebook.png`,
                        alt: 'Rulebook design for the Cybersecurity game.',
                    },
                    {
                        src: `${assetPath}cybersec/CyberSec_SkillCard.png`,
                        alt: 'Skill card design for the Cybersecurity game.',
                    },
                ]}
            />

            <FullImage src={`${assetPath}cybersec/CyberSec_Render_Top.png`} alt="Top-down render of the Cybersecurity board game." thin />

            <StatementBlock label="APPROACH">
                <h2>Testing</h2>
                <ScrollReveal>The game was played at an event and tested by Sopra Steria's cybersecurity experts.</ScrollReveal>
            </StatementBlock>

            {/* ── CHATBOT ── */}

            <WorkHeader
                title="CHATBOT"
                subtitle="004:::CONVERSATIONAL_UI"
                description="One of the first AI projects at Sopra Steria: a general-purpose HR support bot for information within the company. I only did the design."
            />

            <ComparisonBlock
                label="THEME"
                heading="Dark and light mode"
                items={[
                    {
                        caption: 'DARK MODE',
                        src: `${assetPath}chatbot/V1_Dark.png`,
                        alt: 'Chatbot interface in dark mode.',
                    },
                    {
                        caption: 'LIGHT MODE',
                        src: `${assetPath}chatbot/V1_Light.png`,
                        alt: 'Chatbot interface in light mode.',
                    },
                ]}
            />

            {/* ── CLOSING ── */}

            <HeroStatement label="OUTCOME">
                <h2>Status and hindsight</h2>
                <ScrollReveal>
                    As far as I know, the Agile Maturity game is still in use, and the AUTO|Q promotional material did its job well. The chatbot has
                    been discontinued, and I never heard whether the cybersecurity game was a success. In hindsight I would spend more time on the
                    motion design material, and make the board games more game-like and fun.
                </ScrollReveal>
            </HeroStatement>

            <EvidenceRow
                items={[
                    {
                        label: 'PRODUCTS',
                        value: 'AUTO|Q, Agile Maturity, Cybersecurity, HR chatbot',
                    },
                    {
                        label: 'DISCIPLINES',
                        value: 'Game Design, Graphic Design, Motion Design',
                    },
                    { label: 'IMPLEMENTATION', value: 'Figma, Blender, Illustrator, After Effects, Print' },
                ]}
            />
        </>
    );
}
