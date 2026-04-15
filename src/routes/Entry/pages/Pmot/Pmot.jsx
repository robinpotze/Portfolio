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

import { Data } from './pmot.data';

const assetPath = '/img/work/pmot/';

export default function Pmot() {
    return (
        <>
            {/* ── INTRO ── */}

            <CaseIntro
                src={`${assetPath}Landing Page.png`}
                kicker={`PMOT / ${Data.year}`}
                heading="Two platforms. One ecosystem."
                subtitle="Redesigning a STEAM retail store and building a learning platform from scratch."
            />

            {/* ── CHALLENGE ── */}

            <StatementBlock label="CHALLENGE">
                <h2>Low clickthrough, hard navigation, no reason to return.</h2>
                <ScrollReveal>
                    PMOT sells technical learning materials for children aged 2–17, but their existing website struggled with usability and visual
                    appeal. Teachers — the primary audience — needed translated manuals, custom lesson plans, and a reason to come back after
                    purchasing. The objective was to redesign the store while introducing a community learning platform that connects products to
                    educational content.
                </ScrollReveal>
            </StatementBlock>

            <EvidenceRow
                items={[
                    { label: 'CLIENT', value: 'PMOT' },
                    { label: 'AUDIENCE', value: 'Teachers (Benelux)' },
                    { label: 'SCOPE', value: 'Webstore + Learning Platform' },
                    { label: 'PROCESS', value: 'Full design cycle' },
                ]}
            />

            <StatementBlock label="DESIGN CHALLENGE">
                <h2>Visually child-friendly while remaining professional enough for teachers to trust.</h2>
                <ScrollReveal>
                    The products are made for children, but the buyers are educators. The interface had to bridge that gap — approachable enough to
                    signal the right category, structured enough for teachers to navigate efficiently. On top of that, every product needed a
                    counterpart on the learning platform where teachers could find and share lesson materials.
                </ScrollReveal>
            </StatementBlock>

            {/* ── WEBSTORE ── */}

            <WorkHeader
                title="WEBSTORE"
                subtitle="001:::RETAIL_PLATFORM"
                description="A complete redesign of the PMOT retail experience — from product browsing and category navigation to cart, wishlist, and account management. Every page designed for clarity and conversion."
            />

            <FullImage src={`${assetPath}Landing Page.png`} alt="PMOT webstore landing page design." />

            <FeatureSplit
                src={`${assetPath}Product Browser Page.png`}
                alt="Product browser with filtering and category navigation."
                label="PRODUCT BROWSING"
            >
                <h3>Find materials fast, even without knowing the exact name.</h3>
                <ScrollReveal>
                    Category-driven navigation with expanded filtering lets teachers browse by age group, material type, or subject area. The layout
                    was informed by card sorting exercises with users and benchmarked against the most-used Dutch retail platforms.
                </ScrollReveal>
            </FeatureSplit>

            <FeatureSplit
                src={`${assetPath}Categories Expanded.png`}
                alt="Expanded category navigation showing product hierarchy."
                reverse
                label="CATEGORIES"
            >
                <h3>Structured around how teachers think, not how suppliers ship.</h3>
                <ScrollReveal>
                    Product categories were reorganized based on educational context rather than manufacturer groupings — making it intuitive to find
                    materials that fit a lesson plan rather than a stock code.
                </ScrollReveal>
            </FeatureSplit>

            <DoubleImage
                images={[
                    { src: `${assetPath}Shopping Cart Page.png`, alt: 'Shopping cart page with order summary.' },
                    { src: `${assetPath}Wishlist Page.png`, alt: 'Wishlist page for saving products.' },
                ]}
            />

            <ComparisonBlock
                label="ACCOUNT EXPERIENCE"
                heading="Everything in one place — orders, details, access."
                items={[
                    {
                        caption: 'ACCOUNT OVERVIEW',
                        src: `${assetPath}Account Page.png`,
                        alt: 'Account dashboard showing order history and quick actions.',
                    },
                    {
                        caption: 'ACCOUNT DETAILS',
                        src: `${assetPath}Account Details Page.png`,
                        alt: 'Account details page for managing personal information.',
                    },
                ]}
            />

            <DoubleImage
                images={[
                    { src: `${assetPath}Login Page.png`, alt: 'Login page for the PMOT webstore.' },
                    { src: `${assetPath}Registration Page.png`, alt: 'Registration page for new teachers.' },
                ]}
            />

            {/* ── LEARNING PLATFORM ── */}

            <WorkHeader
                title="LEARNING PLATFORM"
                subtitle="002:::EDUCATION"
                description="A community-managed platform where teachers consume and create lesson materials tied to PMOT products. Designed for sharing courses, research, and experiences between educators across the Benelux."
            />

            <FullImage src={`${assetPath}Learning Landing Page.png`} alt="Learning platform landing page." />

            <HeroStatement label="INTEGRATION">
                <h2>Products and lessons, connected by design.</h2>
                <ScrollReveal>
                    Every product in the store has a counterpart on the learning platform — manuals, tasks, and full lesson programs created by the
                    community. Teachers find materials for what they bought; the platform references back to the store. Two sites, one ecosystem.
                </ScrollReveal>
            </HeroStatement>

            <FeatureSplit src={`${assetPath}Learning Lesmaterialen Page.png`} alt="Lesson materials overview page." label="LESSON MATERIALS">
                <h3>Browse, filter, and discover lessons built by other teachers.</h3>
                <ScrollReveal>
                    Community-created lesson programs organized by subject, age group, and associated product. Teachers can publish their own courses
                    and share experiences — turning the platform into a living resource rather than a static repository.
                </ScrollReveal>
            </FeatureSplit>

            <FeatureSplit
                src={`${assetPath}Learning Lesmateriaal Page.png`}
                alt="Individual lesson material detail page."
                reverse
                label="LESSON DETAIL"
            >
                <h3>Complex information, digestible format.</h3>
                <ScrollReveal>
                    Each lesson page structures content for quick scanning — objectives, required materials, step-by-step instructions, and direct
                    links to purchase the products used. Designed so teachers can evaluate a lesson plan in under a minute.
                </ScrollReveal>
            </FeatureSplit>

            <DoubleImage
                images={[
                    { src: `${assetPath}Learning Blog Page.png`, alt: 'Blog section for teacher experiences and research.' },
                    { src: `${assetPath}Learning Leermiddelen Page.png`, alt: 'Learning resources page connecting to store products.' },
                ]}
            />

            <FullImage src={`${assetPath}Learning Login Page.png`} alt="Learning platform login page." />

            {/* ── PROTOTYPING ── */}

            <WorkHeader
                title="PROTOTYPING"
                subtitle="003:::BEHIND_THE_SCENES"
                description="From sketches to Adobe XD to Axure RP 10 — the prototype was rebuilt across tools to meet the design requirements. Axure's advanced interaction capabilities enabled a functional proof of concept with real navigation flows and variable-driven states."
            />

            <DoubleImage
                images={[
                    { src: `${assetPath}BTS Design Overview.png`, alt: 'Design overview showing the full page inventory in Axure.' },
                    { src: `${assetPath}BTS Axure Variables.png`, alt: 'Axure RP variable setup for interactive prototype states.' },
                ]}
            />

            {/* ── OUTCOME ── */}

            <HeroStatement label="OUTCOME">
                <h2>A validated proof of concept, ready for production.</h2>
                <ScrollReveal>
                    The project delivered a complete front-end concept for two integrated websites — validated through expert reviews and
                    thinking-aloud usability tests with the target audience. Design decisions were backed by UX experts consulted across every phase,
                    and the prototype is directly exportable to a functioning front end.
                </ScrollReveal>
            </HeroStatement>

            <EvidenceRow
                items={[
                    { label: 'PLATFORMS', value: 'Webstore + Learning' },
                    { label: 'VALIDATION', value: 'Expert review + User testing' },
                    { label: 'METHODOLOGY', value: 'Full design cycle' },
                    { label: 'TOOLS', value: 'Blender, Illustrator, Axure RP' },
                ]}
            />
        </>
    );
}
