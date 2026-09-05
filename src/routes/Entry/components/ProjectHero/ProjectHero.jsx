import CrsIcon from '@/assets/icons/CRS.svg?react';
import PlsIcon from '@/assets/icons/PLS.svg?react';
import GridOverlay from '@components/ui/GridOverlay';
import ScrollDown from '@components/ui/ScrollDown';
import { EASING, REVEAL, STAGGER } from '@config/animation.config';
import { motion } from 'motion/react';
import styles from './ProjectHero.module.css';

export default function ProjectHero({ content }) {
    const bannerVars = {
        hidden: { opacity: 0, scale: 1.02 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: REVEAL.DURATION, ease: EASING.EMPHASIZED },
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
                ease: EASING.EMPHASIZED,
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
                ease: EASING.EMPHASIZED,
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
                ease: EASING.EMPHASIZED,
            },
        },
    };

    return (
        <div className={styles.section} id="work-hero-section">
            <div className={styles.bannerWrapper}>
                <motion.img
                    className={styles.banner}
                    id={content.title.replaceAll(/\s+/g, '-') + '-hero-banner'}
                    src={content.banner}
                    alt={content.title.replaceAll(/\s+/g, '-') + ' hero banner'}
                    variants={bannerVars}
                    initial="hidden"
                    animate={'visible'}
                />
                <GridOverlay
                    className={styles.gridOverlay}
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

            <motion.div className={styles.content} id="work-hero-content" variants={sideVars} custom={1} initial="hidden" animate={'visible'}>
                <motion.div className={styles.titleWrapper} id="work-hero-title-wrapper" variants={titleVars} initial="hidden" animate={'visible'}>
                    <PlsIcon className={styles.titleDecal} id="work-hero-decal-start" aria-hidden="true" />
                    <h1 id="work-hero-title">{content.title.replaceAll(/\s+/g, '_')}</h1>
                    <PlsIcon className={styles.titleDecal} id="work-hero-decal-end" aria-hidden="true" />
                </motion.div>
            </motion.div>

            <motion.div className={styles.side} id="work-hero-side" variants={sideVars} custom={0} initial="hidden" animate={'visible'}>
                <motion.div className={styles.sideTop} variants={sideGroupVars} initial="hidden" animate="visible">
                    <motion.div variants={sideItemVars}>
                        <motion.div className={styles.iconArray} id="work-hero-icons" variants={sideSubGroupVars}>
                            {content.software.map((software) => (
                                <motion.img
                                    className={styles.sideDecal}
                                    key={software}
                                    src={`/assets/img/software/${software}.svg`}
                                    alt={`${software}-logo`}
                                    variants={sideItemVars}
                                />
                            ))}
                        </motion.div>
                    </motion.div>
                    <motion.div variants={sideItemVars}>
                        <motion.div className={styles.textArray} id="work-hero-side-skills" variants={sideSubGroupVars}>
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
                    <motion.div className={styles.sideDecal} variants={sideItemVars}>
                        <CrsIcon aria-hidden="true" />
                    </motion.div>
                    <motion.div variants={sideItemVars}>
                        <motion.div className={styles.sideText} id="work-hero-side-details" variants={sideSubGroupVars}>
                            <motion.p className={`functional tr90 ${styles.sideTag}`} variants={sideItemVars}>
                                {'PRJ_' + content.id.toString().padStart(3, '0') + ':::'}
                            </motion.p>
                            <motion.p className={`functional tr90 ${styles.sideTag}`} variants={sideItemVars}>
                                {content.client}
                            </motion.p>
                        </motion.div>
                    </motion.div>
                </motion.div>
                <motion.div className={styles.sideBottom} id="work-hero-bottom" variants={sideGroupVars} initial="hidden" animate="visible">
                    <motion.p className={`functional tr90 ${styles.sideTag}`} variants={sideItemVars}>
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
