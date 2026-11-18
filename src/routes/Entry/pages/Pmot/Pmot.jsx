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

const assetPath = '/assets/img/work/pmot/';

export default function Pmot() {
    return (
        <>
            {/* ── INTRO ── */}

            <CaseIntro
                src={`${assetPath}Landing Page.png`}
                kicker="PMOT / 2021–2022"
                heading="A webstore and learning platform for STEAM materials."
                subtitle="Graduation project at Hanze: research, UX and visual design, on my own."
            />

            {/* ── CONTEXT ── */}

            <StatementBlock label="CONTEXT">
                <h2>Graduation project for PMOT</h2>
                <ScrollReveal>
                    PMOT sells STEAM learning materials, such as robotics kits, for children aged 2–17. The buyers are teachers and parents in the
                    Benelux. For my graduation project at Hanze I redesigned the webstore and designed a new learning platform next to it. I worked
                    alone, with one stakeholder at PMOT, for about six months.
                </ScrollReveal>
            </StatementBlock>

            <EvidenceRow
                items={[
                    { label: 'ROLE', value: 'UX and visual design' },
                    { label: 'TEAM', value: 'Solo, one stakeholder' },
                    { label: 'DURATION', value: '~6 months, 2021–2022' },
                    { label: 'OUTPUT', value: 'Webstore + learning platform prototype' },
                ]}
            />

            {/* ── WEBSTORE ── */}

            <WorkHeader
                title="WEBSTORE"
                subtitle="001:::RETAIL_PLATFORM"
                description="A redesign of the PMOT webstore: product browsing, categories, cart, wishlist and account."
            />

            <FullImage src={`${assetPath}Landing Page.png`} alt="PMOT webstore landing page design." />

            <StatementBlock label="PROBLEM">
                <h2>The old store</h2>
                <ScrollReveal>
                    My own review and interviews with customers showed the same issues: low clickthrough, navigation that was hard to follow, and no
                    reason for customers to come back after buying.
                </ScrollReveal>
            </StatementBlock>

            <FeatureSplit
                src={`${assetPath}Product Browser Page.png`}
                alt="Product browser with filtering and category navigation."
                label="PRODUCT BROWSING"
            >
                <h3>Filters for age, material and subject</h3>
                <ScrollReveal>
                    My research combined end-user research, interviews with teachers throughout the project, card sorting and benchmarking against the
                    most-used Dutch retail platforms. The product browser combines category navigation with filters for age group, material type and
                    subject.
                </ScrollReveal>
            </FeatureSplit>

            <FeatureSplit
                src={`${assetPath}Categories Expanded.png`}
                alt="Expanded category navigation showing product hierarchy."
                reverse
                label="CATEGORIES"
            >
                <h3>Grouped by classroom use</h3>
                <ScrollReveal>
                    Based on that research, I grouped the categories by how teachers use the materials in class. Browsing by manufacturer stayed
                    available as a second route.
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
                label="ACCOUNT"
                heading="Orders, details and preferences"
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

            <StatementBlock label="DECISION">
                <h2>Visual style</h2>
                <ScrollReveal>
                    The products are for children, but teachers buy them, so the design had to be approachable and still structured. PMOT's main
                    colour stayed red; I chose a new shade of it and made the other visual decisions myself. I also designed the robot mascot and
                    modelled it in Blender. A robot can be emotive and expressive, and it relates closely to many of the products the store sells.
                </ScrollReveal>
            </StatementBlock>

            {/* ── LEARNING PLATFORM ── */}

            <WorkHeader
                title="LEARNING PLATFORM"
                subtitle="002:::EDUCATION"
                description="A new platform where teachers create and share lessons linked to PMOT products. There was no existing platform; I designed it from the start."
            />

            <FullImage src={`${assetPath}Learning Landing Page.png`} alt="Learning platform landing page." />

            <StatementBlock label="PROBLEM">
                <h2>After the purchase</h2>
                <ScrollReveal>Teachers had no place to find lessons, manuals or other downloads for the products they had bought.</ScrollReveal>
            </StatementBlock>

            <HeroStatement label="APPROACH">
                <h2>Linking products and lessons</h2>
                <ScrollReveal>
                    Teachers write the lessons. They can link products to a lesson, and products carry tags and other metadata that fill in related
                    lessons automatically. The same links give manuals and downloads a place. Connecting the two sites this way was my idea.
                </ScrollReveal>
            </HeroStatement>

            <FeatureSplit src={`${assetPath}Learning Lesmaterialen Page.png`} alt="Lesson materials overview page." label="LESSON MATERIALS">
                <h3>Lesson overview</h3>
                <ScrollReveal>Teachers browse lessons by subject, age group and product, and can publish their own.</ScrollReveal>
            </FeatureSplit>

            <FeatureSplit
                src={`${assetPath}Learning Lesmateriaal Page.png`}
                alt="Individual lesson material detail page."
                reverse
                label="LESSON DETAIL"
            >
                <h3>Lesson page</h3>
                <ScrollReveal>Each lesson lists its objectives, required materials and steps, with links to the products it uses.</ScrollReveal>
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
                subtitle="003:::TESTING"
                description="I started the prototype in Adobe XD and moved to Axure RP early on, then built both sites as one interactive prototype and tested it."
            />

            <StatementBlock label="APPROACH">
                <h2>Expert reviews, user tests and AttrakDiff</h2>
                <ScrollReveal>
                    I validated the prototype with expert reviews, thinking-aloud tests with users, and an AttrakDiff survey. Users found it much
                    easier to use than the old store and more familiar in its design. Navigation from the store to the learning platform needed more
                    guidance.
                </ScrollReveal>
            </StatementBlock>

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
                <h2>Status and hindsight</h2>
                <ScrollReveal>
                    The design did not go live. I wanted to develop it, but we could not agree on a budget. Looking back, I would make something more
                    creative; the design now feels too generic.
                </ScrollReveal>
            </HeroStatement>

            <EvidenceRow
                items={[
                    { label: 'PLATFORMS', value: 'Webstore + learning platform' },
                    { label: 'RESEARCH', value: 'Interviews, card sorting, benchmarking' },
                    { label: 'VALIDATION', value: 'Expert reviews, thinking-aloud tests, AttrakDiff' },
                    { label: 'TOOLS', value: 'Axure RP, Illustrator, Blender' },
                ]}
            />
        </>
    );
}
