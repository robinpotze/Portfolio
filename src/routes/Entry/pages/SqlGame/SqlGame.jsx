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

import { Data } from './sqlgame.data';

const assetPath = '/assets/img/work/ssgnl/sqlgame/';

export default function SqlGame() {
    return (
        <>
            {/* ── INTRO ── */}

            <CaseIntro
                src={`${assetPath}FullPage.webp`}
                kicker={`SOPRA STERIA / ${Data.year}`}
                heading="Write queries. Explore worlds. Learn SQL."
                subtitle="An interactive learning game built almost single-handedly — design, gameplay, and front-end development."
            />

            {/* ── ROLE ── */}

            <StatementBlock label="ROLE">
                <h2>Mine from concept to code.</h2>
                <ScrollReveal>
                    SQL Game was mine from concept to implementation. I designed every screen, defined the gameplay loop, and built the front end.
                    Players write real SQL queries to progress through a world — no multiple choice, no hand-holding.
                </ScrollReveal>
            </StatementBlock>

            <EvidenceRow
                items={[
                    { label: 'CLIENT', value: 'Sopra Steria' },
                    { label: 'ROLE', value: 'Design, Dev, Game Design' },
                    { label: 'TOOLS', value: 'Figma, React' },
                    { label: 'YEAR', value: String(Data.year) },
                ]}
            />

            {/* ── QUERY TOOL ── */}

            <WorkHeader
                title="QUERY TOOL"
                subtitle="001:::CORE_MECHANIC"
                note="SCREENS USE PLACEHOLDER DATA FOR CONFIDENTIALITY"
                description="The central interface. Players type actual SQL statements into a query editor and see immediate visual results. Abstract database operations become concrete the moment the query runs — SELECT, JOIN, WHERE, all of it."
            />

            <FeatureSplit src={`${assetPath}Components_Query.png`} alt="Query editor component breakdown." label="QUERY EDITOR">
                <h3>A real query editor.</h3>
                <ScrollReveal>
                    A sandbox where players write actual SQL statements and see immediate results. No drag-and-drop, no templates — just a query
                    editor, a result set, and a database that responds.
                </ScrollReveal>
            </FeatureSplit>

            <FeatureSplit src={`${assetPath}Components_Interactive.png`} alt="Global interactive components" label="INTERACTIVE" reverse={true}>
                <h3>Every element gives feedback.</h3>
                <ScrollReveal>
                    Apart from the query editor, every component is designed to provide feedback and guide players. Buttons, tooltips, result sets —
                    all built to make the learning feel intuitive and responsive.
                </ScrollReveal>
            </FeatureSplit>

            {/* ── WORLD ── */}

            <WorkHeader
                title="WORLD MAP"
                subtitle="002:::NAVIGATION"
                description="A map screen that gives players context — where they've been, where they're going, and what's left to explore. Each region corresponds to a SQL concept, from basic SELECT statements to complex JOINs."
            />

            <FullImage src={`${assetPath}BookPage_Map.png`} alt="World map page showing explorable regions." />

            {/* ── QUEST SYSTEM ── */}

            <WorkHeader
                title="QUESTS"
                subtitle="003:::PROGRESSION"
                description="Each quest frames a SQL concept as a concrete task — find all merchants in a region, join two tables to track shipments, filter records by date. The learning is embedded in the objective."
            />

            <FeatureSplit src={`${assetPath}BookPage_Quests.png`} alt="Quest book page showing available missions." label="QUEST PAGE">
                <h3>Quests turn concepts into tasks.</h3>
                <ScrollReveal>
                    Each quest is designed to teach a specific SQL concept. Players complete tasks that require writing queries, reinforcing their
                    understanding through practical application.
                </ScrollReveal>
            </FeatureSplit>

            <FeatureSplit src={`${assetPath}Components_Quests.png`} alt="Quest component breakdown." label="QUEST COMPONENTS" reverse={true}>
                <h3>One step at a time.</h3>
                <ScrollReveal>
                    A quest is a stack of steps. Each step holds the task, a help button and one or more answer fields. Finished steps collapse behind
                    a check mark, so players always see what's next, and help stays hidden until they ask for it.
                </ScrollReveal>
            </FeatureSplit>

            {/* ── BOOK PAGES ── */}

            <WorkHeader
                title="REFERENCE BOOK"
                subtitle="004:::KNOWLEDGE_BASE"
                description="An in-game reference that players can consult at any time. SQL syntax, database schemas, inventory — all accessible without leaving the game. Designed for scanning, not studying."
            />

            <DoubleImage
                images={[
                    {
                        src: `${assetPath}BookPage_SQL.png`,
                        alt: 'SQL reference page with syntax examples.',
                    },
                    {
                        src: `${assetPath}BookPage_Database.png`,
                        alt: 'Database schema reference page.',
                    },
                ]}
            />

            <DoubleImage
                images={[
                    {
                        src: `${assetPath}BookPage_Inventory.png`,
                        alt: 'Inventory page showing collected items.',
                    },
                    {
                        src: `${assetPath}Components_Book.png`,
                        alt: 'Book component breakdown.',
                    },
                ]}
            />

            {/* ── AUTH ── */}

            <DoubleImage
                images={[
                    {
                        src: `${assetPath}LoginPage.webp`,
                        alt: 'Login page for SQL Game.',
                    },
                    {
                        src: `${assetPath}RegisterPage.webp`,
                        alt: 'Registration page for new players.',
                    },
                ]}
            />

            {/* ── PROCESS ── */}

            <WorkHeader
                title="ITERATION"
                subtitle="005:::PROCESS"
                description="From wireframes to polished product. Each version stripped away complexity and sharpened the core loop — write a query, see the result, learn the concept."
            />

            <ComparisonBlock
                label="EVOLUTION"
                heading="From wireframe to final product."
                items={[
                    {
                        caption: 'WIREFRAMES',
                        src: `${assetPath}WIP_Wireframes.png`,
                        alt: 'Early wireframe explorations for the game interface.',
                    },
                    {
                        caption: 'FIRST ITERATION',
                        src: `${assetPath}WIP_Iterations.webp`,
                        alt: 'First visual iteration of the game.',
                    },
                ]}
            />

            <ComparisonBlock
                label="REFINEMENT"
                heading="Stripped down, then built back up."
                items={[
                    {
                        caption: 'SECOND ITERATION',
                        src: `${assetPath}WIP_Iterations_Alt.webp`,
                        alt: 'Alternate iteration exploring layout.',
                    },
                    {
                        caption: 'FINAL VERSION',
                        src: `${assetPath}WIP_Iterations_last.png`,
                        alt: 'Final polished version of SQL Game.',
                    },
                ]}
            />

            {/* ── CLOSING ── */}

            <HeroStatement label="OUTCOME">
                <h2>Made for internal training.</h2>
                <ScrollReveal>
                    SQL Game was made for Sopra Steria's internal SQL training. Instead of slides and quizzes, colleagues learn by writing real
                    queries to move through the world, take on quests and manage their inventory.
                </ScrollReveal>
            </HeroStatement>

            <EvidenceRow
                items={[
                    { label: 'USE', value: 'Internal SQL training' },
                    {
                        label: 'SCREENS',
                        value: 'Query tool, map, quests, reference, auth',
                    },
                    {
                        label: 'DISCIPLINES',
                        value: 'UX, Game Design, Front-End Dev',
                    },
                    { label: 'IMPLEMENTATION', value: 'React' },
                ]}
            />
        </>
    );
}
