import ErrorBoundary from '@components/ErrorBoundary';
import GridOverlay from '@components/decoration/GridOverlay';
import PixelCard from '@components/effects/PixelCard/PixelCard';
import { ANIMATION_EASING, ANIMATION_TIMING } from '@config/animation.config';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import './About.css';
import { ABOUT_DATA, ABOUT_SECTIONS } from './about.data';
import EduSection from './components/EduSection';
import ExpSection from './components/ExpSection';
import ListSection from './components/ListSection';

const SECTION_MAP = {
    EXP: { Component: ExpSection, prop: 'data' },
    SKL: { Component: ListSection, prop: 'items' },
    SFT: { Component: ListSection, prop: 'items' },
    EDU: { Component: EduSection, prop: 'data' },
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

/* ── Main component ─────────────────────────────── */

export default function About() {
    const [currentPage, setCurrentPage] = useState('EXP');
    const { Component: Section, prop } = SECTION_MAP[currentPage];

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
                    {ABOUT_SECTIONS.map((key) => (
                        <motion.button
                            key={key}
                            className={`about-selector-button${currentPage === key ? ' active' : ''}`}
                            onClick={() => setCurrentPage(key)}
                            variants={buttonVariants}
                        >
                            <PixelCard gap={5} speed={80} className="about-selector-pixel" />
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
                                <Section {...{ [prop]: ABOUT_DATA[currentPage] }} />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
}
