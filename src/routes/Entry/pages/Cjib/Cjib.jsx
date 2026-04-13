import ScrollReveal from '@components/effects/ScrollReveal';
import WorkHeader from '@components/ui/WorkHeader/WorkHeader';
import styles from '@routes/Entry/Entry.module.css';

const assetPath = '/img/work/cjib/';

export const Data = {
    id: 3,
    title: 'CJIB',
    synopsis: 'Centraal Justitieel Incassobureau.',
    description:
        'At CJIB, I worked as the embedded designer across development teams, shaping technical communication, product identity, and UX for internal systems — including an application for managing seized goods.',
    client: 'CJIB',
    year: 2025,
    software: ['Illustrator', 'AfterEffects', 'Figma', 'Angular', 'Java'],
    skills: ['UX Design', 'System Visualization', 'Technical Communication', 'Interaction Design'],
    banner: `${assetPath}GraphQL Glitch.gif`,
};

export default function Cjib() {
    return (
        <div>
            {/* ── INTRO ── */}

            <section className={styles.caseIntro}>
                <video src={`${assetPath}Presentation.mp4`} autoPlay loop muted playsInline />
                <div className={styles.caseIntroOverlay}>
                    <p className={styles.kicker}>CJIB / 2024</p>
                    <h1>Designing clarity across fragmented systems.</h1>
                    <p>Embedded designer across development teams.</p>
                </div>
            </section>

            {/* ── ROLE ── */}

            <section className={styles.statementBlock}>
                <p className={styles.label}>ROLE</p>
                <h2>Sole designer across three product teams.</h2>
                <ScrollReveal>
                    I translated complex operational systems into usable interfaces, technical narratives, and visual material for stakeholders who
                    had never seen their own infrastructure explained clearly.
                </ScrollReveal>
            </section>

            <section className={styles.evidenceRow}>
                <div className={styles.evidenceItem}>
                    <strong>SCOPE</strong>
                    <span>3 product teams</span>
                </div>
                <div className={styles.evidenceItem}>
                    <strong>DURATION</strong>
                    <span>12 months</span>
                </div>
                <div className={styles.evidenceItem}>
                    <strong>ROLE</strong>
                    <span>Sole designer</span>
                </div>
                <div className={styles.evidenceItem}>
                    <strong>OUTPUT</strong>
                    <span>Motion, documentation, product UX</span>
                </div>
            </section>

            <hr className={styles.divider} />

            {/* ── COMMUNICATING SYSTEMS ── */}

            <WorkHeader
                title="COMMUNICATING SYSTEMS"
                subtitle="MOTION:::TECHNICAL_NARRATIVE"
                description="Internal presentations at CJIB relied on stock templates and wall-of-text slides. I produced animated transitions, data visualizations, and identity sequences that made technical architecture legible to non-technical stakeholders."
            />

            <section className={styles.statementBlock}>
                <p className={styles.label}>DECISION</p>
                <h2>REST endpoints could not match the UI's data needs. GraphQL could.</h2>
            </section>

            <div className={styles.full}>
                <img src={`${assetPath}GraphQL Transition_1.gif`} alt="Animated transition showing GraphQL query flow through the system." />
            </div>

            <section className={styles.featureSplit}>
                <div className={styles.featureMedia}>
                    <img src={`${assetPath}McDonalds_Logo.gif`} alt="Animated logo sequence for internal presentation material." />
                </div>
                <div className={styles.featureBody}>
                    <p className={styles.label}>MOTION LANGUAGE</p>
                    <h3>Making internal material feel deliberate.</h3>
                    <ScrollReveal>
                        Animated identities and transitional graphics that made technical presentations coherent and memorable — replacing generic
                        templates with purposeful visual storytelling.
                    </ScrollReveal>
                </div>
            </section>

            <hr className={styles.divider} />

            {/* ── PBS DOCUMENTATION ── */}

            <WorkHeader
                title="PBS"
                subtitle="SYSTEM:::DOCUMENTATION"
                description="Persoonsbeeldenservice — the system that aggregates fragmented identity data into unified profiles. I designed the full documentation site for developers integrating with the API."
            />

            <div className={styles.full}>
                <img src={`${assetPath}LANDING TMI.png`} alt="Landing page for the PBS documentation website." />
            </div>

            <div className={styles.isolatedVisual}>
                <img src={`${assetPath}INFOGRAPHIC LARGE.png`} alt="Technical architecture infographic for PBS." />
            </div>

            <section className={styles.heroStatement}>
                <p className={styles.label}>SYSTEM OVERVIEW</p>
                <h2>One profile layer over fragmented government data.</h2>
                <ScrollReveal>
                    PBS aggregates multiple identity sources into a single integration model. The documentation maps every connection state and
                    failure path so developers know exactly what to expect before writing a line of code.
                </ScrollReveal>
            </section>

            <section className={styles.comparisonBlock}>
                <div className={styles.comparisonIntro}>
                    <p className={styles.label}>API STATES</p>
                    <h2>Documenting what works and what breaks.</h2>
                    <ScrollReveal>
                        Connection success and error states needed to be immediately legible. Each state has a dedicated reference page with cause,
                        resolution, and relevant code samples.
                    </ScrollReveal>
                </div>
                <div className={styles.comparisonGrid}>
                    <figure>
                        <figcaption>CONNECTION SUCCESS</figcaption>
                        <img src={`${assetPath}Connection succes.png`} alt="Successful connection state in PBS documentation." />
                    </figure>
                    <figure>
                        <figcaption>ERROR HANDLING</figcaption>
                        <img src={`${assetPath}ERROR INFO.png`} alt="Error handling reference in PBS documentation." />
                    </figure>
                </div>
            </section>

            <hr className={styles.divider} />

            {/* ── BESLAGPORTAAL ── */}

            <section className={styles.statementBlock}>
                <p className={styles.label}>PROBLEM</p>
                <h2>Case data, seized goods, and search were spread across disconnected tools.</h2>
                <ScrollReveal>
                    Officers had to reconstruct context across multiple systems for every case. The existing tooling made it difficult to track what
                    was seized, where it was stored, and what its legal status was.
                </ScrollReveal>
            </section>

            <WorkHeader
                title="BESLAGPORTAAL"
                subtitle="UX:::ITEM_MANAGEMENT"
                description="A dedicated application that consolidates search, case records, and item management into one workflow — replacing the fragmented systems officers relied on."
            />

            <section className={styles.statementBlock}>
                <p className={styles.label}>CASE OVERVIEW</p>
                <h2>All case data, one screen.</h2>
            </section>

            <div className={styles.full}>
                <img src={`${assetPath}Zaakoverzicht-v1.png`} alt="Case overview screen of the Beslagportaal application." />
            </div>

            <section className={styles.statementBlock}>
                <p className={styles.label}>SEARCH</p>
                <h2>From partial case numbers to the right record in one query.</h2>
                <ScrollReveal>
                    Officers work with incomplete information — a fragment of a case number, an uncertain item description. The search interface was
                    designed around that ambiguity, with flexible filtering and fast results across thousands of records.
                </ScrollReveal>
            </section>

            <div className={styles.full}>
                <img src={`${assetPath}Zoeken.png`} alt="Search interface for locating seized items across thousands of records." />
            </div>

            <section className={styles.comparisonBlock}>
                <div className={styles.comparisonIntro}>
                    <p className={styles.label}>ITERATION</p>
                    <h2>From layout-first to scanability-first.</h2>
                </div>
                <div className={styles.comparisonGrid}>
                    <figure>
                        <figcaption>EARLY STRUCTURE</figcaption>
                        <img src={`${assetPath}V1.png`} alt="Early iteration establishing information architecture." />
                    </figure>
                    <figure>
                        <figcaption>REFINED HIERARCHY</figcaption>
                        <img src={`${assetPath}V2.png`} alt="Later iteration with refined hierarchy and interaction patterns." />
                    </figure>
                </div>
            </section>

            <section className={styles.featureSplitReverse}>
                <div className={styles.featureMedia}>
                    <img src={`${assetPath}Beslagvoorwerp.png`} alt="Detail view for an individual seized item." />
                </div>
                <div className={styles.featureBody}>
                    <p className={styles.label}>DETAIL VIEW</p>
                    <h3>Every seized item, fully contextualized.</h3>
                </div>
            </section>

            <hr className={styles.divider} />

            {/* ── CLOSING ── */}

            <section className={styles.heroStatement}>
                <p className={styles.label}>OUTCOME</p>
                <h2>Unified systems, clearer workflows, scalable foundations.</h2>
                <ScrollReveal>
                    A cohesive identity layer for fragmented government data. An item-management application that replaced disconnected tools with a
                    single workflow. Technical communication that made complex systems legible to the people who depend on them.
                </ScrollReveal>
            </section>

            <section className={styles.evidenceRow}>
                <div className={styles.evidenceItem}>
                    <strong>SYSTEMS DESIGNED</strong>
                    <span>PBS, Beslagportaal</span>
                </div>
                <div className={styles.evidenceItem}>
                    <strong>COMMUNICATION</strong>
                    <span>Motion, infographics, documentation</span>
                </div>
                <div className={styles.evidenceItem}>
                    <strong>IMPLEMENTATION</strong>
                    <span>Angular, Pega Cosmos</span>
                </div>
            </section>
        </div>
    );
}
