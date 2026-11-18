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

const assetPath = '/assets/img/work/ssgnl/sqlgame/';

export default function SqlGame() {
    return (
        <>
            {/* ── INTRO ── */}

            <CaseIntro
                src={`${assetPath}FullPage.webp`}
                kicker="SOPRA STERIA / 2023–NOW"
                heading="A game for learning SQL on a real database."
                subtitle="Design and development, together with Iris as ideator and SQL expert."
            />

            {/* ── CONTEXT ── */}

            <StatementBlock label="CONTEXT">
                <h2>An internal training game</h2>
                <ScrollReveal>
                    Sopra Steria commissioned Monster DB for its internal trainees. I design and develop it together with my colleague Iris. She is
                    the main ideator and the SQL expert, wrote all quests and learning material, and also develops on the side. The project started in
                    2023 and is still running.
                </ScrollReveal>
            </StatementBlock>

            <EvidenceRow
                items={[
                    { label: 'ROLE', value: 'Design and development' },
                    { label: 'TEAM', value: 'Iris and me' },
                    { label: 'DURATION', value: '2023 – ongoing' },
                    { label: 'OUTPUT', value: 'Playable game, in pilot' },
                ]}
            />

            {/* ── QUERY TOOL ── */}

            <WorkHeader
                title="QUERY TOOL"
                subtitle="001:::CORE_MECHANIC"
                description="A fully functional query tool that runs real SQL against a database. It is the core of the game."
            />

            <FeatureSplit src={`${assetPath}Components_Query.png`} alt="Query editor component breakdown." label="QUERY EDITOR">
                <h3>Feedback from the database</h3>
                <ScrollReveal>
                    Players write SQL in the editor. The feedback is whatever the database returns: the result set, or its error message.
                </ScrollReveal>
            </FeatureSplit>

            <StatementBlock label="DECISION">
                <h2>Layered security</h2>
                <ScrollReveal>
                    Because players run real queries, we built layered security so each user can only access their own tables.
                </ScrollReveal>
            </StatementBlock>

            <FeatureSplit src={`${assetPath}Components_Interactive.png`} alt="Global interactive components" label="INTERACTIVE" reverse={true}>
                <h3>Supporting components</h3>
                <ScrollReveal>Buttons, navigation tabs, input fields and status messages used across the game.</ScrollReveal>
            </FeatureSplit>

            {/* ── WORLD ── */}

            <WorkHeader
                title="WORLD MAP"
                subtitle="002:::NAVIGATION"
                description="The map lets players immerse themselves in the game world. In a later version it will also carry more detailed feedback."
            />

            <FullImage src={`${assetPath}BookPage_Map.png`} alt="World map page showing explorable regions." />

            {/* ── QUEST SYSTEM ── */}

            <WorkHeader
                title="QUESTS"
                subtitle="003:::PROGRESSION"
                description="Iris turned SQL concepts into quests based on her expert knowledge: scenarios in which players have to analyse the database to move on."
            />

            <FeatureSplit src={`${assetPath}BookPage_Quests.png`} alt="Quest book page showing available missions." label="QUEST PAGE">
                <h3>A quest step</h3>
                <ScrollReveal>
                    When a step says "talk to the merchant", the player has to find the merchant's ID, find the table that uses that ID, and retrieve
                    the item from it.
                </ScrollReveal>
            </FeatureSplit>

            <FeatureSplit src={`${assetPath}Components_Quests.png`} alt="Quest component breakdown." label="QUEST COMPONENTS" reverse={true}>
                <h3>Quest building blocks</h3>
                <ScrollReveal>The components I designed to show quests and their steps.</ScrollReveal>
            </FeatureSplit>

            {/* ── BOOK PAGES ── */}

            <WorkHeader
                title="THE BOOK"
                subtitle="004:::INTERFACE"
                description="The book holds the story, the player's journal and most of the interface, including SQL syntax, the database schema and the inventory."
            />

            <StatementBlock label="DECISION">
                <h2>Why a book</h2>
                <ScrollReveal>The game tells a story, so it made sense to make the interface itself a book.</ScrollReveal>
            </StatementBlock>

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
                        alt: 'Login page for Monster DB.',
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
                description="The game is still being iterated on. I change the designs and the code together."
            />

            <StatementBlock label="PROBLEM">
                <h2>Where the wireframes stopped</h2>
                <ScrollReveal>
                    The wireframes set out layouts for interaction and information, but they did not cover things like branching quests and connected
                    information.
                </ScrollReveal>
            </StatementBlock>

            <StatementBlock label="APPROACH">
                <h2>Design and code in step</h2>
                <ScrollReveal>As the game grew, I iterated on the code and the designs together so they kept matching.</ScrollReveal>
            </StatementBlock>

            <ComparisonBlock
                label="ITERATION"
                heading="Wireframes and first iteration"
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
                label="ITERATION"
                heading="Second iteration and current version"
                items={[
                    {
                        caption: 'SECOND ITERATION',
                        src: `${assetPath}WIP_Iterations_Alt.webp`,
                        alt: 'Alternate iteration exploring layout.',
                    },
                    {
                        caption: 'CURRENT VERSION',
                        src: `${assetPath}WIP_Iterations_last.png`,
                        alt: 'Current version of Monster DB.',
                    },
                ]}
            />

            {/* ── CLOSING ── */}

            <HeroStatement label="OUTCOME">
                <h2>Status and hindsight</h2>
                <ScrollReveal>
                    The game is in use with a pilot group and in some classroom settings. Players find it fun, but still a bit confusing. Next time I
                    would define the requirements properly beforehand to avoid scope creep. I would also like more time for it: working on it on the
                    side has made progress slow.
                </ScrollReveal>
            </HeroStatement>

            <EvidenceRow
                items={[
                    {
                        label: 'SCREENS',
                        value: 'Query tool, map, quests, book, login',
                    },
                    {
                        label: 'DISCIPLINES',
                        value: 'UX, Game Design, Front-End Dev',
                    },
                    { label: 'IMPLEMENTATION', value: 'Figma, React' },
                ]}
            />
        </>
    );
}
