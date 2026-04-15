import ScrollReveal from '@components/effects/ScrollReveal';
import CaseIntro from '@components/ui/CaseIntro/CaseIntro';
import ComparisonBlock from '@components/ui/ComparisonBlock/ComparisonBlock';
import EvidenceRow from '@components/ui/EvidenceRow/EvidenceRow';
import FeatureSplit from '@components/ui/FeatureSplit/FeatureSplit';
import FullImage from '@components/ui/FullImage/FullImage';
import HeroStatement from '@components/ui/HeroStatement/HeroStatement';
import StatementBlock from '@components/ui/StatementBlock/StatementBlock';
import WorkHeader from '@components/ui/WorkHeader/WorkHeader';
import styles from '@routes/Entry/Entry.module.css';

const assetPath = '/img/work/cjib/';

export default function Cjib() {
    return (
        <>
            {/* ── INTRO ── */}

            <CaseIntro
                src={`${assetPath}Presentation.mp4`}
                kicker="CJIB / 2024"
                heading="Designing clarity across fragmented systems."
                subtitle="Embedded designer across development teams."
            />

            {/* ── ROLE ── */}

            <StatementBlock label="ROLE">
                <h2>Sole designer across three product teams.</h2>
                <ScrollReveal>
                    I translated complex operational systems into usable interfaces, technical narratives, and visual material for stakeholders who
                    had never seen their own infrastructure explained clearly.
                </ScrollReveal>
            </StatementBlock>

            <EvidenceRow
                items={[
                    { label: 'SCOPE', value: '3 product teams' },
                    { label: 'DURATION', value: '12 months' },
                    { label: 'ROLE', value: 'Sole designer' },
                    { label: 'OUTPUT', value: 'Motion, documentation, product UX' },
                ]}
            />

            {/* ── COMMUNICATING SYSTEMS ── */}

            <WorkHeader
                title="COMMUNICATING SYSTEMS"
                subtitle="MOTION:::TECHNICAL_NARRATIVE"
                description="Internal presentations at CJIB relied on stock templates and wall-of-text slides. I produced animated transitions, data visualizations, and identity sequences that made technical architecture legible to non-technical stakeholders."
            />

            <StatementBlock label="DECISION">
                <h2>REST endpoints could not match the UI's data needs. GraphQL could.</h2>
            </StatementBlock>

            <FullImage src={`${assetPath}GraphQLTransition.gif`} alt="Animated transition showing GraphQL query flow through the system." />

            <FeatureSplit src={`${assetPath}McDonalds_Logo.gif`} alt="Animated logo sequence for internal presentation material." label="MOTION LANGUAGE">
                <h3>Making internal material feel deliberate.</h3>
                <ScrollReveal>
                    Animated identities and transitional graphics that made technical presentations coherent and memorable — replacing generic
                    templates with purposeful visual storytelling.
                </ScrollReveal>
            </FeatureSplit>

            {/* ── PBS DOCUMENTATION ── */}

            <WorkHeader
                title="PBS"
                subtitle="SYSTEM:::DOCUMENTATION"
                description="Persoonsbeeldenservice — the system that aggregates fragmented identity data into unified profiles. I designed the full documentation site for developers integrating with the API."
            />

            <FullImage src={`${assetPath}LANDING TMI.png`} alt="Landing page for the PBS documentation website." />

            <HeroStatement label="SYSTEM OVERVIEW">
                <h2>One profile layer over fragmented government data.</h2>
                <ScrollReveal>
                    PBS aggregates multiple identity sources into a single integration model. The documentation maps every connection state and
                    failure path so developers know exactly what to expect before writing a line of code.
                </ScrollReveal>
            </HeroStatement>

            <div className={styles.isolatedVisual}>
                <img src={`${assetPath}INFOGRAPHIC LARGE.png`} alt="Technical architecture infographic for PBS." />
            </div>

            <StatementBlock label="API STATES">
                <h3>Documenting what works and what breaks.</h3>
                <ScrollReveal>
                    Connection success and error states needed to be immediately legible. Each state has a dedicated reference page with cause,
                    resolution, and relevant code samples.
                </ScrollReveal>
                <img className={styles.imgFullWidth} src={`${assetPath}INFOGRAPHIC.png`} alt="Normal request reference in PBS documentation." />
                <img className={styles.imgFullWidth} src={`${assetPath}ERROR INFO.png`} alt="Error handling reference in PBS documentation." />
            </StatementBlock>

            <ComparisonBlock
                label="API DOCUMENTATION"
                heading="From cool designs to workable pages."
                items={[
                    { caption: 'ORIGINAL DESIGN', src: `${assetPath}PBS-MenuDocs-Design.png`, alt: 'Early iteration of PBS documentation with text-heavy reference pages.' },
                    { caption: 'TONED DOWN', src: `${assetPath}PBS-MenuDocs-Clean.png`, alt: 'Later iteration of PBS documentation with visual reference pages.' },
                ]}
            />

            {/* ── BESLAGPORTAAL ── */}

            <WorkHeader
                title="BESLAGPORTAAL"
                subtitle="UX:::ITEM_MANAGEMENT"
                description="A dedicated application that consolidates search, case records, and item management into one workflow — replacing the fragmented systems officers relied on."
            />

            <StatementBlock label="PROBLEM">
                <h2>Case data, seized goods, and search were spread across disconnected tools.</h2>
                <ScrollReveal>
                    Officers had to reconstruct context across multiple systems for every case. The existing tooling made it difficult to track what
                    was seized, where it was stored, and what its legal status was.
                </ScrollReveal>
            </StatementBlock>

            <StatementBlock label="CASE OVERVIEW">
                <h2>All case data, one screen.</h2>
            </StatementBlock>

            <FullImage src={`${assetPath}Zaakoverzicht-v1.png`} alt="Case overview screen of the Beslagportaal application." />

            <StatementBlock label="SEARCH">
                <h2>From partial case numbers to the right record in one query.</h2>
                <ScrollReveal>
                    Officers work with incomplete information — a fragment of a case number, an uncertain item description. The search interface was
                    designed around that ambiguity, with flexible filtering and fast results across thousands of records.
                </ScrollReveal>
            </StatementBlock>

            <FullImage src={`${assetPath}Zoeken.png`} alt="Search interface for locating seized items across thousands of records." />

            <ComparisonBlock
                label="ITERATION"
                heading="From layout-first to scanability-first."
                items={[
                    { caption: 'EARLY STRUCTURE', src: `${assetPath}V1.png`, alt: 'Early iteration establishing information architecture.' },
                    { caption: 'REFINED HIERARCHY', src: `${assetPath}V2.png`, alt: 'Later iteration with refined hierarchy and interaction patterns.' },
                ]}
            />

            <FeatureSplit src={`${assetPath}Beslagvoorwerp.png`} alt="Detail view for an individual seized item." reverse label="DETAIL VIEW">
                <h3>Every seized item, fully contextualized.</h3>
            </FeatureSplit>

            {/* ── CLOSING ── */}

            <HeroStatement label="OUTCOME">
                <h2>Unified systems, clearer workflows, scalable foundations.</h2>
                <ScrollReveal>
                    A cohesive identity layer for fragmented government data. An item-management application that replaced disconnected tools with a
                    single workflow. Technical communication that made complex systems legible to the people who depend on them.
                </ScrollReveal>
            </HeroStatement>

            <EvidenceRow
                items={[
                    { label: 'SYSTEMS DESIGNED', value: 'PBS, Beslagportaal' },
                    { label: 'COMMUNICATION', value: 'Motion, infographics, documentation' },
                    { label: 'IMPLEMENTATION', value: 'Angular, Pega Cosmos' },
                ]}
            />
        </>
    );
}
