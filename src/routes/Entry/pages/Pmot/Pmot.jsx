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

import { Data } from './pmot.data';

const assetPath = '/assets/img/work/pmot/';

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
                <h2>No reason to come back.</h2>
                <ScrollReveal>
                    PMOT sells technical learning materials for children aged 2–17, but their existing website struggled with usability and visual
                    appeal. Teachers — the primary audience — needed translated manuals, custom lesson plans, and a reason to come back after
                    purchasing. The objective was to redesign the store while introducing a community learning platform that connects products to
                    educational content. Seven interviews with past customers and an analysis of three of the largest Dutch webstores set the
                    requirements.
                </ScrollReveal>
            </StatementBlock>

            <EvidenceRow
                items={[
                    { label: 'CLIENT', value: 'PMOT' },
                    { label: 'AUDIENCE', value: 'Teachers (Benelux)' },
                    { label: 'SCOPE', value: 'Webstore + Learning Platform' },
                    { label: 'TYPE', value: 'Graduation project' },
                ]}
            />

            <StatementBlock label="DESIGN CHALLENGE">
                <h2>Made for kids, bought by teachers.</h2>
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
                <h3>Find it without the exact name.</h3>
                <ScrollReveal>
                    Category-driven navigation with expanded filtering lets teachers browse by age group, material type, or subject area. The layout
                    came from a card sort with twelve teachers and was benchmarked against three of the largest Dutch webstores.
                </ScrollReveal>
            </FeatureSplit>

            <FeatureSplit
                src={`${assetPath}Categories Expanded.png`}
                alt="Expanded category navigation showing product hierarchy."
                reverse
                label="CATEGORIES"
            >
                <h3>Sorted the way teachers think.</h3>
                <ScrollReveal>
                    Product categories were reorganized based on educational context rather than manufacturer groupings — making it intuitive to find
                    materials that fit a lesson plan rather than a stock code.
                </ScrollReveal>
            </FeatureSplit>

            <DoubleImage
                images={[
                    {
                        src: `${assetPath}Shopping Cart Page.png`,
                        alt: 'Shopping cart page with order summary.',
                    },
                    {
                        src: `${assetPath}Wishlist Page.png`,
                        alt: 'Wishlist page for saving products.',
                    },
                ]}
            />

            <ComparisonBlock
                label="ACCOUNT EXPERIENCE"
                heading="Orders and details in one place."
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
                    {
                        src: `${assetPath}Login Page.png`,
                        alt: 'Login page for the PMOT webstore.',
                    },
                    {
                        src: `${assetPath}Registration Page.png`,
                        alt: 'Registration page for new teachers.',
                    },
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
                <h2>Products and lessons, linked both ways.</h2>
                <ScrollReveal>
                    In testing, teachers often missed the learning platform until someone pointed it out, and wanted to get from a product to its
                    lessons, and back, more easily. So every product now links to its manuals, tasks and lesson programs, every lesson links to the
                    products it uses, and both sites sit in the header of each.
                </ScrollReveal>
            </HeroStatement>

            <FeatureSplit src={`${assetPath}Learning Lesmaterialen Page.png`} alt="Lesson materials overview page." label="LESSON MATERIALS">
                <h3>Lessons built by other teachers.</h3>
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
                    Each lesson page shows the author, subject, date and objectives up front, then the required materials, step-by-step instructions,
                    and direct links to buy the products used, so teachers can judge a lesson at a glance.
                </ScrollReveal>
            </FeatureSplit>

            <DoubleImage
                images={[
                    {
                        src: `${assetPath}Learning Blog Page.png`,
                        alt: 'Blog section for teacher experiences and research.',
                    },
                    {
                        src: `${assetPath}Learning Leermiddelen Page.png`,
                        alt: 'Learning resources page connecting to store products.',
                    },
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
                    {
                        src: `${assetPath}BTS Design Overview.png`,
                        alt: 'Design overview showing the full page inventory in Axure.',
                    },
                    {
                        src: `${assetPath}BTS Axure Variables.png`,
                        alt: 'Axure RP variable setup for interactive prototype states.',
                    },
                ]}
            />

            {/* ── OUTCOME ── */}

            <HeroStatement label="OUTCOME">
                <h2>Rated higher on every scale.</h2>
                <ScrollReveal>
                    Fourteen teachers rated the old site and then the prototype in an AttrakDiff survey. The prototype scored higher on every scale.
                    Attractiveness rose the most, from about −1.5 to almost 2 on a scale of −3 to 3. Novelty rose the least, which was the goal: the
                    store was meant to feel familiar. Expert reviews and think-aloud tests with teachers shaped the version they rated.
                </ScrollReveal>
            </HeroStatement>

            <StatementBlock label="NEXT TIME">
                <h2>Make contributing easy.</h2>
                <ScrollReveal>
                    Teachers saw the learning platform as a much-needed tool but worried about the effort of writing lessons for it. A next version
                    would make contributing easier, and add the multiple wishlists and clearer cart feedback that teachers asked for.
                </ScrollReveal>
            </StatementBlock>

            <EvidenceRow
                items={[
                    { label: 'RESEARCH', value: '7 interviews, card sort with 12 teachers' },
                    {
                        label: 'VALIDATION',
                        value: 'Expert reviews, think-aloud tests, AttrakDiff with 14 teachers',
                    },
                    { label: 'TOOLS', value: 'Figma, Adobe XD, Axure RP, Illustrator, Blender' },
                ]}
            />
        </>
    );
}
