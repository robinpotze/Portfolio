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

import { Data } from './cjib.data';

const assetPath = '/img/work/cjib/';

export default function Cjib() {
    return (
        <>
            {/* ── INTRO ── */}

            <CaseIntro
                src={`${assetPath}Presentation.mp4`}
                kicker={`CJIB / ${Data.year}`}
                heading="Three teams. Twelve months. One designer."
                subtitle="Embedded at CJIB to make government infrastructure legible."
            />

            {/* ── ROLE ── */}

            <StatementBlock label="ROLE">
                <h2>Nobody had visualized these systems before. That was the job.</h2>
                <ScrollReveal>
                    Three product teams running parallel workstreams — motion design, developer documentation, and seizure-management UX. No
                    templates. No precedent. Every deliverable built from zero.
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
                subtitle="001:::MOTION_DESIGN"
                description="CJIB's internal presentations were walls of text over stock templates. I replaced them with animated system narratives — transitions that traced data through architecture, identity sequences that gave each team a visual language worth remembering."
            />

            <StatementBlock label="DECISION">
                <h2>REST couldn't match the data layer. GraphQL could. That story needed telling in sixty seconds.</h2>
            </StatementBlock>

            <FullImage src={`${assetPath}GraphQLTransition.gif`} alt="Animated transition showing GraphQL query flow through the system." />

            <FeatureSplit
                src={`${assetPath}McDonalds_Logo.gif`}
                alt="Animated logo sequence for internal presentation material."
                label="MOTION LANGUAGE"
            >
                <h3>Identity sequences for teams that never had one.</h3>
                <ScrollReveal>
                    Animated transitions and motion graphics that replaced generic slide decks with deliberate visual storytelling. Each team got a
                    recognizable visual language — not a template, a system.
                </ScrollReveal>
            </FeatureSplit>

            {/* ── PBS DOCUMENTATION ── */}

            <WorkHeader
                title="PBS"
                subtitle="002:::DOCUMENTATION"
                description="The system that merges fragmented government identity data into unified person profiles. Dozens of integration states. Hundreds of edge cases. I designed the documentation site that maps it all for the developers building against it."
            />

            <FullImage src={`${assetPath}LANDING TMI.png`} alt="Landing page for the PBS documentation website." />

            <HeroStatement label="SYSTEM OVERVIEW">
                <h2>One identity layer across every government source.</h2>
                <ScrollReveal>
                    PBS pulls from multiple registries to construct a single profile model. The documentation accounts for every connection state and
                    failure path — no ambiguity, no guesswork. Developers know what breaks before they write a line of code.
                </ScrollReveal>
            </HeroStatement>

            <div className={styles.isolatedVisual}>
                <img src={`${assetPath}INFOGRAPHIC LARGE.png`} alt="Technical architecture infographic for PBS." />
            </div>

            <StatementBlock label="API STATES">
                <h3>Every state documented. Every failure explained.</h3>
                <ScrollReveal>
                    Success paths and error states on dedicated reference pages — cause, resolution, and code samples. No hunting through changelogs.
                </ScrollReveal>
                <img className={styles.imgFullWidth} src={`${assetPath}INFOGRAPHIC.png`} alt="Normal request reference in PBS documentation." />
                <img className={styles.imgFullWidth} src={`${assetPath}ERROR INFO.png`} alt="Error handling reference in PBS documentation." />
            </StatementBlock>

            <ComparisonBlock
                label="API DOCUMENTATION"
                heading="Stripped back until only the useful parts remained."
                items={[
                    {
                        caption: 'ORIGINAL DESIGN',
                        src: `${assetPath}PBS-MenuDocs-Design.png`,
                        alt: 'Early iteration of PBS documentation with text-heavy reference pages.',
                    },
                    {
                        caption: 'TONED DOWN',
                        src: `${assetPath}PBS-MenuDocs-Clean.png`,
                        alt: 'Later iteration of PBS documentation with visual reference pages.',
                    },
                ]}
            />

            {/* ── BESLAGPORTAAL ── */}

            <WorkHeader
                title="BESLAGPORTAAL"
                subtitle="003:::UX_DESIGN"
                description="Search, case records, and seized-item management in one application. Officers were reconstructing context across three disconnected tools for every case. That workflow ended here."
            />

            <StatementBlock label="PROBLEM">
                <h2>Every case meant rebuilding context from scratch.</h2>
                <ScrollReveal>
                    What was seized, where it was stored, what its legal status was — all scattered across disconnected systems. Officers spent more
                    time navigating tools than doing their jobs.
                </ScrollReveal>
            </StatementBlock>

            <StatementBlock label="CASE OVERVIEW">
                <h2>One screen. Full context. No reconstruction.</h2>
            </StatementBlock>

            <FullImage src={`${assetPath}Zaakoverzicht-v1.png`} alt="Case overview screen of the Beslagportaal application." />

            <StatementBlock label="SEARCH">
                <h2>Partial numbers. Uncertain descriptions. Still finds the record.</h2>
                <ScrollReveal>
                    Officers work with incomplete information — a fragment of a case number, a vague item description. The search was built for that
                    ambiguity. Flexible filters, fast results, thousands of records.
                </ScrollReveal>
            </StatementBlock>

            <FullImage src={`${assetPath}Zoeken.png`} alt="Search interface for locating seized items across thousands of records." />

            <ComparisonBlock
                label="ITERATION"
                heading="Stripped for scanability."
                items={[
                    { caption: 'EARLY STRUCTURE', src: `${assetPath}V1.png`, alt: 'Early iteration establishing information architecture.' },
                    {
                        caption: 'REFINED HIERARCHY',
                        src: `${assetPath}V2.png`,
                        alt: 'Later iteration with refined hierarchy and interaction patterns.',
                    },
                ]}
            />

            <FeatureSplit src={`${assetPath}Beslagvoorwerp.png`} alt="Detail view for an individual seized item." reverse label="DETAIL VIEW">
                <h3>Every seized item, fully contextualized.</h3>
            </FeatureSplit>

            {/* ── CLOSING ── */}

            <HeroStatement label="OUTCOME">
                <h2>Systems that explain themselves.</h2>
                <ScrollReveal>
                    A documentation layer that made PBS integration predictable. An item-management application that replaced fragmented tools with a
                    single workflow. Motion design that turned invisible infrastructure into something stakeholders could finally point at.
                </ScrollReveal>
            </HeroStatement>

            <EvidenceRow
                items={[
                    { label: 'SYSTEMS', value: 'PBS, ABE, BSP' },
                    { label: 'SKILLS', value: 'Motion Design, Infographics, Documentation, UX Design' },
                    { label: 'IMPLEMENTATION', value: 'Angular, Antora, SpectaQl, AfterEffects' },
                ]}
            />
        </>
    );
}
