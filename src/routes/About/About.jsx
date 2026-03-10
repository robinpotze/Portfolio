import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CurtainTransition from '@components/effects/CurtainTransition/CurtainTransition';
import ErrorBoundary from '@components/ErrorBoundary';
import NavigationMenu from '@components/layout/NavigationMenu/NavigationMenu';
import GridOverlay from '@components/decoration/GridOverlay';
import { ANIMATION_TIMING, ANIMATION_EASING } from '@config/animation.config';
import './About.css';

const SECTIONS = ['EXP', 'SKL', 'SFT', 'EDU'];

const DATA = {
    EXP: [
        {
            name: 'Sopra Steria',
            function: 'UX Designer',
            date: '2022-NOW',
            details: [
                { text: 'Lorem Ipsum', icon: '/img/icon/MRK.svg' },
                { text: 'Dolar est', icon: '/img/icon/MRK.svg' },
                { text: 'Liquidatum', icon: '/img/icon/MRK.svg' },
            ],
        },
        {
            name: 'PMOT',
            function: 'Brand & UX Designer',
            date: '2021-2022',
            details: [
                { text: 'Lorem Ipsum', icon: '/img/icon/MRK.svg' },
                { text: 'Dolar est', icon: '/img/icon/MRK.svg' },
                { text: 'Liquidatum', icon: '/img/icon/MRK.svg' },
            ],
        },
        {
            name: 'Vixel',
            function: 'Creative Developer',
            date: '2020-2021',
            details: [
                { text: 'Lorem Ipsum', icon: '/img/icon/MRK.svg' },
                { text: 'Dolar est', icon: '/img/icon/MRK.svg' },
                { text: 'Liquidatum', icon: '/img/icon/MRK.svg' },
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
        { text: 'After Effects', icon: '/img/icon/BRC.svg' },
        { text: 'Blender', icon: '/img/software/Blender.svg' },
        { text: 'Unreal', icon: '/img/icon/BRC.svg' },
    ],
    EDU: [
        { text: 'Hanze Groningen', icon: '/img/icon/GAT.svg' },
        { text: 'Communication & Multimedia Design - Game Design, Bsc.', icon: '/img/icon/CHK.svg' },
        { text: '2017-2022', icon: '/img/icon/CRS.svg' },
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
            return <ListSection items={DATA.EDU} />;
        default:
            return null;
    }
}

/* ── Main component ─────────────────────────────── */

export default function About() {
    const [currentPage, setCurrentPage] = useState('EXP');
    const [curtainOpen, setCurtainOpen] = useState(false);
    const [targetPageName, setTargetPageName] = useState(null);
    const hasEntryAnimated = useRef(false);

    useEffect(() => {
        if (hasEntryAnimated.current) return;
        hasEntryAnimated.current = true;

        setCurtainOpen(true);
        setTimeout(() => {
            setCurtainOpen(false);
        }, ANIMATION_TIMING.CURTAIN_REVEAL_DELAY);
    }, []);

    return (
        <ErrorBoundary>
            <div className="about-page">
                <CurtainTransition isOpen={curtainOpen} direction="right" pageName={targetPageName} />
                <NavigationMenu />
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
                <div className="about-selector">
                    {SECTIONS.map((key) => (
                        <button
                            key={key}
                            className={`about-selector-button${currentPage === key ? ' active' : ''}`}
                            onClick={() => setCurrentPage(key)}
                        >
                            {key}
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
                        </button>
                    ))}
                </div>

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
