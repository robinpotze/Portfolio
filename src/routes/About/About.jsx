import ErrorBoundary from '@components/ErrorBoundary';
import GridOverlay from '@components/decoration/GridOverlay';
import { ANIMATION_EASING, ANIMATION_TIMING } from '@config/animation.config';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import './About.css';

const SECTIONS = ['EXP', 'SKL', 'SFT', 'EDU'];

const DATA = {
    EXP: [
        {
            name: 'Sopra Steria',
            function: 'UX Designer',
            date: '2022-NOW',
            details: [
                { text: 'Designed and developed serious games in both digital and physical formats.', icon: '/img/icon/MRK.svg' },
                { text: 'Designed and developed UX for various clients in the public services sector.', icon: '/img/icon/MRK.svg' },
                { text: 'Designed multiple marketing campaigns and promotional materials.', icon: '/img/icon/MRK.svg' },
            ],
        },
        {
            name: 'PMOT',
            function: 'Brand & UX Designer',
            date: '2021-2022',
            details: [
                { text: 'Designed a new webstore and introduced a mascot. Redesigned the logo, revamped brand colouring and adhered to industry standard UX practices', icon: '/img/icon/MRK.svg' },
                { text: 'Introduced a learning platform in the same branding with a larger focus on industry standard designs in learning tools.', icon: '/img/icon/MRK.svg' },
                { text: 'Created a link between the products and the learning materials to create a USP', icon: '/img/icon/MRK.svg' },
            ],
        },
        {
            name: 'Vixel',
            function: 'Creative Developer',
            date: '2020-2021',
            details: [
                { text: 'Concepted and developed new User Avatars to fit gender, size and VR engineering environments.', icon: '/img/icon/MRK.svg' },
                { text: 'Concepted and developed 3D assets for tools to be used in the ArchViz VR software.', icon: '/img/icon/MRK.svg' },
                { text: 'Ran end-user usability tests with the created assets and iterated on the feedback throughout the process.', icon: '/img/icon/MRK.svg' },
            ],
        },
    ],
    SKL: [
        { text: 'User Interface Design', icon: '/img/icon/PLS.svg' },
        { text: 'Brand Identity', icon: '/img/icon/PLS.svg' },
        { text: '3D Modeling', icon: '/img/icon/PLS.svg' },
        { text: 'Visual Effects', icon: '/img/icon/PLS.svg' },
    ],
    SFT: [
        { text: 'Figma', icon: '/img/software/Figma.svg' },
        { text: 'After Effects', icon: '/img/software/AfterEffects.svg' },
        { text: 'Blender', icon: '/img/software/Blender.svg' },
        { text: 'Unreal', icon: '/img/software/Unreal.svg' },
    ],
    EDU: [
        { school: 'Hanze', icon: '/img/icon/GAT.svg' },
        { course: 'Communication & Multimedia Design - Game Design, Bsc.'},
        { date: '2017-2022'},
    ],
};

/* ── Framer-motion variants ─────────────────────── */

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: ANIMATION_TIMING.ABOUT_ITEM_STAGGER,
            delayChildren: ANIMATION_TIMING.ABOUT_SECTION_DELAY,
        },
    },
    exit: {
        opacity: 0,
        y: 12,
        transition: { duration: ANIMATION_TIMING.ABOUT_EXIT_DURATION },
    },
};

const itemVariants = {
    hidden: { opacity: 0, x: -24 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: ANIMATION_TIMING.ABOUT_ITEM_DURATION,
            ease: ANIMATION_EASING.ABOUT,
        },
    },
};

const headerVariants = {
    hidden: { opacity: 0, y: -12 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: ANIMATION_TIMING.ABOUT_HEADER_DURATION,
            ease: ANIMATION_EASING.ABOUT,
        },
    },
};

const buttonContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: ANIMATION_TIMING.ABOUT_ITEM_STAGGER,
            delayChildren: ANIMATION_TIMING.ABOUT_SECTION_DELAY,
        },
    },
};

const buttonVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: ANIMATION_TIMING.ABOUT_ITEM_DURATION,
            ease: ANIMATION_EASING.ABOUT,
        },
    },
};

/* ── Shared list item component ─────────────────── */

function AboutItem({ text, icon, meta }) {
    return (
        <motion.li className="about-item" variants={itemVariants}>
            <div className="about-item-icon">
                <img src={icon} alt="" />
            </div>
            <span className="about-item-text">{text}</span>
            {meta && <span className="about-item-meta">{meta}</span>}
        </motion.li>
    );
}

/* ── Section renderers ──────────────────────────── */

function ExpSection({ data }) {
    return (
        <>
            {data.map((entry) => (
                <div className="about-subsection" key={entry.name + entry.date}>
                    <motion.div className="about-subsection-header" variants={headerVariants}>
                        <span className="about-subsection-name">{entry.name}</span>
                        <span className="about-subsection-function">{entry.function}</span>
                        <span className="about-subsection-date">{entry.date}</span>
                    </motion.div>
                    <ul className="about-list">
                        {entry.details.map((item, i) => (
                            <AboutItem key={i} text={item.text} icon={item.icon} />
                        ))}
                    </ul>
                </div>
            ))}
        </>
    );
}

function EduSection({ data }) {
    return (
        <>
            {data.map((entry) => (
                <div className="about-subsection" key={entry.school + entry.course + entry.date}>
                    <motion.div className="about-subsection-header" variants={headerVariants}>
                        <span className="about-subsection-name">{entry.school}</span>
                        <span className="about-subsection-course">{entry.course}</span>
                        <span className="about-subsection-date">{entry.date}</span>
                    </motion.div>
                </div>
            ))}
        </>
    );
}

function ListSection({ items }) {
    return (
        <ul className="about-list">
            {items.map((item, i) => (
                <AboutItem key={i} text={item.text} icon={item.icon} />
            ))}
        </ul>
    );
}

function renderSection(key) {
    switch (key) {
        case 'EXP':
            return <ExpSection data={DATA.EXP} />;
        case 'SKL':
            return <ListSection items={DATA.SKL} />;
        case 'SFT':
            return <ListSection items={DATA.SFT} />;
        case 'EDU':
            return <EduSection data={DATA.EDU} />;
        default:
            return null;
    }
}

/* ── Main component ─────────────────────────────── */

export default function About() {
    const [currentPage, setCurrentPage] = useState('EXP');

    return (
        <ErrorBoundary>
            <div className="about-page">
                <GridOverlay
                    className="about-grid-overlay"
                    cellMinSize={100}
                    cellMaxSize={200}
                    stripeChance={0.35}
                    stripeCount={30}
                    stripeOpacity={0.1}
                    crosshairSize={64}
                    crosshairOpacity={0.3}
                    parallaxStrength={10}
                />
                <motion.div
                    className="about-selector"
                    variants={buttonContainerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {SECTIONS.map((key) => (
                        <motion.button
                            key={key}
                            className={`about-selector-button${currentPage === key ? ' active' : ''}`}
                            onClick={() => setCurrentPage(key)}
                            variants={buttonVariants}
                        >
                            <h2 className='tr90'>{key}</h2>
                            {currentPage === key && (
                                <motion.div
                                    className="about-selector-indicator"
                                    layoutId="about-indicator"
                                    transition={{
                                        type: 'spring',
                                        stiffness: 500,
                                        damping: 35,
                                    }}
                                />
                            )}
                        </motion.button>
                    ))}
                </motion.div>

                <div className="about-details">
                    <h1 className="about-name">Robin Potze</h1>

                    <div className="about-content-scroll">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentPage}
                                className="about-content"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                            >
                                {renderSection(currentPage)}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
}
