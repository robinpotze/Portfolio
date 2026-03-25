/* eslint-disable react/prop-types */

import GridOverlay from '@components/decoration/GridOverlay';
import ScrollDown from '@components/decoration/ScrollDown';
import { EASING, REVEAL, STAGGER } from '@config/animation.config';
import { motion } from 'framer-motion';
import './ProjectHero.css';

export default function ProjectHero({ content }) {
    const bannerVars = {
        hidden: { opacity: 0, scale: 1.02 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: REVEAL.DURATION, ease: EASING.HERO },
        },
    };

    const sideVars = {
        hidden: { opacity: 0, x: 12 },
        visible: (i = 0) => ({
            opacity: 1,
            x: 0,
            transition: {
                duration: REVEAL.DURATION,
                delay: STAGGER.DEFAULT + i * STAGGER.MICRO,
                ease: EASING.HERO,
            },
        }),
    };

    const sideGroupVars = {
        hidden: { opacity: 1 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: STAGGER.FAST,
                delayChildren: STAGGER.DEFAULT,
            },
        },
    };

    const sideSubGroupVars = {
        hidden: { opacity: 1 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: STAGGER.MICRO,
            },
        },
    };

    const sideItemVars = {
        hidden: { opacity: 0, x: REVEAL.X_OFFSET * 2 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: REVEAL.QUICK_DURATION,
                ease: EASING.HERO,
            },
        },
    };

    const titleVars = {
        hidden: { opacity: 0, y: 8 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: REVEAL.DURATION,
                delay: STAGGER.DEFAULT + STAGGER.SLOW,
                ease: EASING.HERO,
            },
        },
    };

    return (
        <div className="hero-section" id="work-hero-section">
            <div className="hero-banner-wrapper">
                <motion.img
                    className="hero-banner"
                    id={content.title.replaceAll(/\s+/g, '-') + '-hero-banner'}
                    src={content.banner}
                    alt={content.title.replaceAll(/\s+/g, '-') + ' hero banner'}
                    variants={bannerVars}
                    initial="hidden"
                    animate={'visible'}
                />
                <GridOverlay
                    className="hero-grid-overlay"
                    cellMinSize={100}
                    cellMaxSize={200}
                    stripeChance={0.35}
                    stripeCount={30}
                    stripeOpacity={0.1}
                    crosshairSize={64}
                    crosshairOpacity={0.3}
                    parallaxStrength={10}
                />
            </div>

            <motion.div className="hero-content" id="work-hero-content" variants={sideVars} custom={1} initial="hidden" animate={'visible'}>
                <motion.div className="hero-title-wrapper" id="work-hero-title-wrapper" variants={titleVars} initial="hidden" animate={'visible'}>
                    <img className="hero-title-decal" id="work-hero-decal-start" src="/img/icon/PLS.svg" alt="Plus Sign" />
                    <h2 id="work-hero-title">{content.title.replaceAll(/\s+/g, '_')}</h2>
                    <img className="hero-title-decal" id="work-hero-decal-end" src="/img/icon/PLS.svg" alt="Plus Sign" />
                </motion.div>
            </motion.div>

            <motion.div className="hero-side" id="work-hero-side" variants={sideVars} custom={0} initial="hidden" animate={'visible'}>
                <motion.div className="hero-side-top" variants={sideGroupVars} initial="hidden" animate="visible">
                    <motion.div variants={sideItemVars}>
                        <motion.div className="icon-array" id="work-hero-icons" variants={sideSubGroupVars}>
                            {content.software.map((software) => (
                                <motion.img
                                    className="hero-side-decal"
                                    key={software}
                                    src={`/img/software/${software}.svg`}
                                    alt={`${software}-logo`}
                                    variants={sideItemVars}
                                />
                            ))}
                        </motion.div>
                    </motion.div>
                    <motion.div variants={sideItemVars}>
                        <motion.div className="text-array" id="work-hero-side-skills" variants={sideSubGroupVars}>
                            {content.skills.map((skill) => (
                                <motion.p
                                    className="tr90"
                                    key={skill}
                                    id={`hero-side-skill-${skill.toLowerCase().replaceAll(/\s+/g, '-')}`}
                                    variants={sideItemVars}
                                >
                                    {skill.toLowerCase().replaceAll(/\s+/g, '_') + '_/'}
                                </motion.p>
                            ))}
                        </motion.div>
                    </motion.div>
                    <motion.img className="hero-side-decal" src="/img/icon/CRS.svg" alt="A Cross Divider" variants={sideItemVars} />
                    <motion.div variants={sideItemVars}>
                        <motion.div className="hero-side-text" id="work-hero-side-details" variants={sideSubGroupVars}>
                            <motion.p className="functional tr90" id="work-hero-side-id" variants={sideItemVars}>
                                {'PRJ_' + content.id.toString().padStart(3, '0') + ':::'}
                            </motion.p>
                            <motion.p className="functional tr90" id="work-hero-side-client" variants={sideItemVars}>
                                {content.client}
                            </motion.p>
                        </motion.div>
                    </motion.div>
                </motion.div>
                <motion.div className="hero-side-bottom" id="work-hero-bottom" variants={sideGroupVars} initial="hidden" animate="visible">
                    <motion.p className="functional tr90" id="work-hero-side-year" variants={sideItemVars}>
                        {content.year}
                    </motion.p>
                    <motion.div variants={sideItemVars}>
                        <ScrollDown />
                    </motion.div>
                </motion.div>
            </motion.div>
        </div>
    );
}
