import ScrollReveal from '@components/ui/ScrollReveal';
import CaseIntro from '@components/sections/CaseIntro/CaseIntro';
import ComparisonBlock from '@components/sections/ComparisonBlock/ComparisonBlock';
import EvidenceRow from '@components/sections/EvidenceRow/EvidenceRow';
import FeatureSplit from '@components/sections/FeatureSplit/FeatureSplit';
import FullImage from '@components/sections/FullImage/FullImage';
import HeroStatement from '@components/sections/HeroStatement/HeroStatement';
import StatementBlock from '@components/sections/StatementBlock/StatementBlock';
import WorkHeader from '@components/sections/WorkHeader/WorkHeader';
import styles from '@routes/Entry/Entry.module.css';

const assetPath = '/assets/img/work/cjib/';

export default function Cjib() {
    return (
        <>
            {/* ── INTRO ── */}

            <CaseIntro
                src={`${assetPath}Presentation.mp4`}
                kicker="CJIB / 2023–2025"
                heading="Design and testing for CJIB's internal systems."
                subtitle="Test automation engineer, then UX designer for three development teams."
            />

            {/* ── CONTEXT ── */}

            <StatementBlock label="CONTEXT">
                <h2>From test automation to UX design</h2>
                <ScrollReveal>
                    I joined a development team of six at CJIB as a test automation engineer. After about four months I switched to UX design, and
                    later also worked as the UX designer for two other teams of six to eight people. The work covered three areas: motion design for
                    internal presentations, the documentation site for PBS, and the design of Beslagportaal.
                </ScrollReveal>
            </StatementBlock>

            <EvidenceRow
                items={[
                    { label: 'ROLE', value: 'Test automation, then UX design' },
                    { label: 'TEAM', value: '3 teams of 6–8' },
                    { label: 'DURATION', value: 'Oct 2023 – Jul 2025' },
                    {
                        label: 'OUTPUT',
                        value: 'Motion, documentation, product UX',
                    },
                ]}
            />

            {/* ── TEST AUTOMATION ── */}

            <WorkHeader
                title="TEST AUTOMATION"
                subtitle="001:::QUALITY_ASSURANCE"
                description="My first four months at CJIB, as test automation engineer in my base team."
            />

            <StatementBlock label="APPROACH">
                <h2>From Tosca to Cucumber</h2>
                <ScrollReveal>I started with Tosca. The team then moved to a custom test setup in Java, based on Cucumber.</ScrollReveal>
            </StatementBlock>

            {/* ── COMMUNICATING SYSTEMS ── */}

            <WorkHeader
                title="COMMUNICATING SYSTEMS"
                subtitle="002:::MOTION_DESIGN"
                description="Animations for company-wide presentations, explaining how our systems work to stakeholders and developers."
            />

            <StatementBlock label="PROBLEM">
                <h2>Explaining a move away from REST</h2>
                <ScrollReveal>
                    Our presentations to the company were bare slides, shown to stakeholders and developers from other teams. REST was the well-known
                    standard in the company, and our lead developer had chosen GraphQL instead. The presentations had to explain that deviation and
                    how GraphQL works in our context.
                </ScrollReveal>
            </StatementBlock>

            <FeatureSplit
                src={`${assetPath}McDonalds_Logo.webp`}
                alt="Animated logo sequence for internal presentation material."
                label="MOTION LANGUAGE"
            >
                <h3>The menu metaphor</h3>
                <ScrollReveal>
                    In a GraphQL request you list the nested fields you want, and you get exactly those back. I compared that to ordering from a
                    McDonald's menu: you get what you ask for, nothing more and nothing less. I built the animations in After Effects around that
                    metaphor.
                </ScrollReveal>
            </FeatureSplit>

            <FullImage src={`${assetPath}GraphQLTransition.webp`} alt="Animated transition showing GraphQL query flow through the system." />

            {/* ── PBS DOCUMENTATION ── */}

            <WorkHeader
                title="PBS"
                subtitle="003:::DOCUMENTATION"
                description="PBS gives internal applications one central access point for the data they need. I designed its documentation site and built it together with the team."
            />

            <FullImage src={`${assetPath}LANDING TMI.png`} alt="Landing page for the PBS documentation website." />

            <StatementBlock label="PROBLEM">
                <h2>A new API language</h2>
                <ScrollReveal>
                    The same switch to GraphQL reached the developers integrating with PBS, who had not worked with it before. They needed to be
                    guided through working with a different API language.
                </ScrollReveal>
            </StatementBlock>

            <HeroStatement label="APPROACH">
                <h2>System overview</h2>
                <ScrollReveal>The site starts with an architecture infographic of how internal applications get their data through PBS.</ScrollReveal>
            </HeroStatement>

            <div className={styles.isolatedVisual}>
                <img src={`${assetPath}INFOGRAPHIC LARGE.png`} alt="Technical architecture infographic for PBS." />
            </div>

            <StatementBlock label="APPROACH">
                <h3>Request and error states</h3>
                <ScrollReveal>Success and error responses each have a reference page with the cause, the resolution and code samples.</ScrollReveal>
                <img className={styles.imgFullWidth} src={`${assetPath}INFOGRAPHIC.png`} alt="Normal request reference in PBS documentation." />
                <img className={styles.imgFullWidth} src={`${assetPath}ERROR INFO.png`} alt="Error handling reference in PBS documentation." />
            </StatementBlock>

            <StatementBlock label="DECISION">
                <h3>Matching the internal documentation</h3>
                <ScrollReveal>
                    I simplified the first design so it matched the company's other documentation pages, which made it familiar to internal
                    developers.
                </ScrollReveal>
            </StatementBlock>

            <ComparisonBlock
                label="API DOCUMENTATION"
                heading="First design and simplified version"
                items={[
                    {
                        caption: 'V1: CUSTOM DESIGN',
                        src: `${assetPath}PBS-MenuDocs-Design.png`,
                        alt: 'Early iteration of PBS documentation with text-heavy reference pages.',
                    },
                    {
                        caption: 'V2: ALIGNED WITH INTERNAL DOCS',
                        src: `${assetPath}PBS-MenuDocs-Clean.png`,
                        alt: 'Later iteration of PBS documentation with visual reference pages.',
                    },
                ]}
            />

            {/* ── BESLAGPORTAAL ── */}

            <WorkHeader
                title="BESLAGPORTAAL"
                subtitle="004:::UX_DESIGN"
                description="An application for CJIB employees to look up cases and manage seized items. I did the design; it was still in development when I left, and the screens below are not final."
            />

            <StatementBlock label="PROBLEM">
                <h2>Split across applications</h2>
                <ScrollReveal>
                    Employees worked with several custom internal applications. What was seized, where it was stored and its legal status were spread
                    across them.
                </ScrollReveal>
            </StatementBlock>

            <StatementBlock label="APPROACH">
                <h2>Case overview</h2>
                <ScrollReveal>I designed a case overview that brings that information together on one screen.</ScrollReveal>
            </StatementBlock>

            <FullImage src={`${assetPath}Zaakoverzicht-v1.png`} alt="Case overview screen of the Beslagportaal application." />

            <StatementBlock label="APPROACH">
                <h2>Search</h2>
                <ScrollReveal>
                    I based the search screen mostly on an internal registration number that identifies a person. This supports CJIB's Persoonsgericht
                    werken initiative: working around the person instead of the case.
                </ScrollReveal>
            </StatementBlock>

            <FullImage src={`${assetPath}Zoeken.png`} alt="Search screen of the Beslagportaal application." />

            <StatementBlock label="DECISION">
                <h3>Toward standard case management</h3>
                <ScrollReveal>
                    The first version nested the information more deeply. For the second I moved to a more standard case management layout.
                </ScrollReveal>
            </StatementBlock>

            <ComparisonBlock
                label="ITERATION"
                heading="Case overview iterations"
                items={[
                    {
                        caption: 'V1: NESTED STRUCTURE',
                        src: `${assetPath}V1.png`,
                        alt: 'Early iteration establishing information architecture.',
                    },
                    {
                        caption: 'V2: STANDARD CASE MANAGEMENT',
                        src: `${assetPath}V2.png`,
                        alt: 'Later iteration with revised hierarchy and interaction patterns.',
                    },
                ]}
            />

            <FeatureSplit src={`${assetPath}Beslagvoorwerp.png`} alt="Detail view for an individual seized item." reverse label="DETAIL VIEW">
                <h3>Seized item detail</h3>
                <ScrollReveal>
                    Each seized item expands in the list to show its details, a note and its status: open, in progress or completed.
                </ScrollReveal>
            </FeatureSplit>

            {/* ── CLOSING ── */}

            <HeroStatement label="OUTCOME">
                <h2>Status and hindsight</h2>
                <ScrollReveal>
                    PBS is in use. Beslagportaal was still in development when I left. In hindsight, I would have built the PBS documentation as a
                    custom site instead of on a documentation framework. For Beslagportaal I would start from a case management perspective and focus
                    on cognitive load. I had too little input from users, and the designs show it.
                </ScrollReveal>
            </HeroStatement>

            <EvidenceRow
                items={[
                    { label: 'SYSTEMS', value: 'PBS, BSP' },
                    {
                        label: 'SKILLS',
                        value: 'Motion Design, Infographics, Documentation, UX Design',
                    },
                    {
                        label: 'IMPLEMENTATION',
                        value: 'Angular, Antora, SpectaQL, After Effects, Tosca, Cucumber',
                    },
                ]}
            />
        </>
    );
}
