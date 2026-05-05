import SnDecal from '@/assets/decals/SN.svg?react';
import ChkIcon from '@/assets/icons/CHK.svg?react';
import CrsIcon from '@/assets/icons/CRS.svg?react';
import MsgIcon from '@/assets/icons/MSG.svg?react';
import PlsIcon from '@/assets/icons/PLS.svg?react';
import ErrorBoundary from '@components/ErrorBoundary';
import RadGridTxt from '@components/ui/RadialText/TXT/RAD_GRID_TXT';
import StatusMessage from '@components/ui/StatusMessage/StatusMessage';
import TypewriterText from '@components/ui/TypewriterText';
import { EASING, REVEAL, STAGGER, TIMEOUT } from '@config/animation.config';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useRef, useState } from 'react';
import { CONTACT_FORM_URL, CORNER_BL_LINES, ERROR_LOG_LINES, STATUS_GRID_LINES } from './contact.data';
import styles from './Contact.module.css';

const PHASE_CONFIG = {
    message: {
        title: 'CNTCT-FRM',
        titleClass: styles.messageTitle,
        formClass: styles.messageForm,
        statusFormClass: styles.statusForm,
        statusType: null,
        statusMessage: null,
    },
    intercept: {
        title: 'WDBND-PKT_DE-ENCAP',
        titleClass: styles.messageTitleIntercept,
        formClass: styles.messageFormIntercept,
        statusFormClass: styles.statusForm,
        statusType: 'error',
        statusMessage: (
            <>
                INTERCEPT
                <br />
                DETECTED
            </>
        ),
    },
    complete: {
        title: 'MSG-RELAYED',
        titleClass: styles.messageTitleComplete,
        formClass: null,
        statusFormClass: styles.statusFormComplete,
        statusType: 'success',
        statusMessage: (
            <>
                MESSAGE
                <br />
                RELAYED
            </>
        ),
    },
};

const scaleExit = {
    opacity: 0,
    scaleY: 0,
    transition: {
        duration: REVEAL.MEDIUM_DURATION,
        ease: EASING.EXIT,
    },
};

const statusFormVariants = {
    hidden: {
        scaleX: 0,
        opacity: 1,
    },
    visible: {
        scaleX: 1,
        opacity: 1,
        transition: {
            delay: REVEAL.MEDIUM_DURATION,
            duration: REVEAL.SLOW_DURATION,
            ease: EASING.EMPHASIZED,
        },
    },
    exit: scaleExit,
};

const statusFormContentVariants = {
    hidden: {
        opacity: 0,
    },
    visible: {
        opacity: 1,
        transition: {
            duration: REVEAL.DURATION,
            delay: REVEAL.LONG_DURATION,
        },
    },
};

const cornerVariants = {
    hidden: (direction) => ({
        opacity: 0,
        x: direction.x,
        y: direction.y,
    }),
    visible: {
        opacity: 1,
        x: 0,
        y: 0,
        transition: {
            duration: REVEAL.QUICK_DURATION,
            delay: REVEAL.LONG_DURATION + STAGGER.PAGE,
            ease: EASING.EMPHASIZED,
        },
    },
    exit: {
        opacity: 0,
        transition: {
            duration: REVEAL.EXIT_DURATION,
            ease: EASING.EXIT,
        },
    },
};

const messageFormVariants = {
    hidden: {
        opacity: 0,
        scaleX: 0,
    },
    visible: {
        opacity: 1,
        scaleX: 1,
        transition: {
            delay: STAGGER.PAGE,
            duration: REVEAL.SLOW_DURATION,
            ease: EASING.EMPHASIZED,
            delayChildren: STAGGER.PAGE,
            staggerChildren: STAGGER.PAGE,
        },
    },
    exit: scaleExit,
};

const fieldVariants = {
    hidden: {
        opacity: 0,
    },
    visible: {
        opacity: 1,
        transition: {
            duration: REVEAL.MEDIUM_DURATION,
            ease: EASING.EMPHASIZED,
        },
    },
};

const titleVariants = {
    hidden: { opacity: 0, y: REVEAL.Y_OFFSET },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: REVEAL.QUICK_DURATION,
            ease: EASING.EMPHASIZED,
        },
    },
    exit: {
        opacity: 0,
        y: -REVEAL.Y_OFFSET,
        transition: {
            duration: REVEAL.EXIT_DURATION,
            ease: EASING.EXIT,
        },
    },
};

export default function Contact() {
    const filterAnimRef = useRef(null);

    const [phase, setPhase] = useState('message');
    const [formData, setFormData] = useState({ name: '', message: '', email: '' });
    const [glitching, setGlitching] = useState(false);

    const isIntercept = phase === 'intercept';
    const showIntercept = isIntercept || glitching;
    const activeConfig = glitching ? PHASE_CONFIG.intercept : PHASE_CONFIG[phase];
    const { title, titleClass, formClass, statusFormClass, statusType, statusMessage } = activeConfig;

    const canSend = formData.name.trim() !== '' && formData.message.trim() !== '';
    const canIdentify = formData.email.trim() !== '';

    const handleInputChange = useCallback(
        (field) => (e) => {
            setFormData((prev) => ({ ...prev, [field]: e.target.value }));
        },
        []
    );

    const handleSend = useCallback(() => {
        if (canSend && !glitching) {
            setGlitching(true);
            filterAnimRef.current?.beginElement();
            setTimeout(() => {
                setPhase('intercept');
                setGlitching(false);
            }, TIMEOUT.GLITCH_DURATION_MS);
        }
    }, [canSend, glitching]);

    const handleIdentify = useCallback(async () => {
        if (canIdentify) {
            try {
                const res = await fetch(CONTACT_FORM_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });

                if (!res.ok) {throw new Error('Send failed');}
            } catch {
                // Still show complete phase — message failure is silent to not break UX
                console.error('Failed to send contact form');
            }
            setPhase('complete');
        }
    }, [canIdentify, formData]);

    const handleEmailKeyDown = useCallback(
        (e) => {
            if (e.key === 'Enter') {
                handleIdentify();
            }
        },
        [handleIdentify]
    );

    return (
        <ErrorBoundary>
            <div className={`${styles.page} ${glitching ? styles.pageGlitch : ''}`}>
                <svg className={styles.svgFilters} aria-hidden="true">
                    <defs>
                        <filter id="glitchDisplace">
                            <feTurbulence type="fractalNoise" baseFrequency="0.01 0.15" numOctaves="1" seed="3" result="noise" />
                            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G">
                                <animate
                                    ref={filterAnimRef}
                                    attributeName="scale"
                                    values="0;70;0;55;0;85;0;0;45;40;0;75;0;0"
                                    keyTimes="0;0.04;0.07;0.10;0.13;0.16;0.22;0.35;0.38;0.55;0.62;0.72;0.78;1"
                                    dur="1.2s"
                                    begin="indefinite"
                                    fill="freeze"
                                />
                            </feDisplacementMap>
                        </filter>
                    </defs>
                </svg>

                {glitching && (
                    <div className={styles.glitchOverlay} aria-hidden="true">
                        <div className={styles.glitchLayer1} />
                        <div className={styles.glitchLayer2} />
                        <div className={styles.glitchFlash} />
                        <span className={styles.glitchWarning}>WARNING: SIGNAL INTERCEPT</span>
                    </div>
                )}

                <AnimatePresence>
                    {phase !== 'complete' && (
                        <motion.h2 className={titleClass} variants={titleVariants} initial="hidden" animate="visible" exit="exit">
                            {title}
                        </motion.h2>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {phase !== 'complete' && (
                        <motion.div
                            className={glitching ? styles.messageFormGlitch : formClass}
                            variants={messageFormVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <motion.div className={styles.nameField} variants={fieldVariants}>
                                <PlsIcon className={styles.fieldCornerTL} aria-hidden="true" />
                                <PlsIcon className={styles.fieldCornerTR} aria-hidden="true" />
                                <CrsIcon className={styles.fieldMarker} aria-hidden="true" />
                                <MsgIcon className={styles.nameIcon} aria-hidden="true" />
                                <input
                                    className={styles.nameInput}
                                    placeholder="USR.NAME"
                                    value={formData.name}
                                    onChange={handleInputChange('name')}
                                    disabled={showIntercept}
                                />
                                <PlsIcon className={styles.fieldCornerBL} aria-hidden="true" />
                                <PlsIcon className={styles.fieldCornerBR} aria-hidden="true" />
                            </motion.div>
                            <motion.div className={styles.messageField} variants={fieldVariants}>
                                <PlsIcon className={styles.fieldCornerTL} aria-hidden="true" />
                                <PlsIcon className={styles.fieldCornerTR} aria-hidden="true" />
                                <CrsIcon className={styles.fieldMarker} aria-hidden="true" />
                                <div className={styles.messageSideBar}>
                                    <MsgIcon className={styles.messageIcon} aria-hidden="true" />
                                    <SnDecal className={styles.decal} aria-hidden="true" />
                                </div>
                                <textarea
                                    className={styles.messageInput}
                                    placeholder="MSG.PAYLOAD"
                                    value={formData.message}
                                    onChange={handleInputChange('message')}
                                    disabled={showIntercept}
                                />
                                <PlsIcon className={styles.fieldCornerBL} aria-hidden="true" />
                                <PlsIcon className={styles.fieldCornerBR} aria-hidden="true" />
                            </motion.div>
                            <motion.button
                                className={styles.sendButton}
                                onClick={handleSend}
                                disabled={!canSend || isIntercept || glitching}
                                variants={fieldVariants}
                            >
                                MSG.SEND <span className="material-symbols-sharp">format_text_overflow</span>
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {phase !== 'message' && (
                        <motion.div
                            className={styles.errorSection}
                            initial={{ opacity: 1 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, transition: { duration: REVEAL.EXIT_DURATION, ease: EASING.EXIT } }}
                        >
                            <StatusMessage status={statusType} message={statusMessage} delay={REVEAL.MEDIUM_DURATION + 2 * STAGGER.PAGE} />
                            {isIntercept && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{
                                        opacity: 1,
                                        transition: {
                                            delay: REVEAL.MEDIUM_DURATION + 3 * STAGGER.PAGE,
                                            duration: REVEAL.QUICK_DURATION,
                                            ease: EASING.EMPHASIZED,
                                        },
                                    }}
                                    exit={{
                                        opacity: 0,
                                        transition: {
                                            duration: REVEAL.EXIT_DURATION,
                                            ease: EASING.EXIT,
                                        },
                                    }}
                                >
                                    <TypewriterText
                                        lines={ERROR_LOG_LINES}
                                        className={styles.errorlog}
                                        rowClassName={styles.logRow}
                                        delay={(REVEAL.MEDIUM_DURATION + 3 * STAGGER.PAGE) * 1000}
                                    />
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {isIntercept && (
                        <>
                            <motion.div
                                className={styles.cornerTl}
                                custom={{ y: STAGGER.DEFAULT * 200 }}
                                variants={cornerVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                            >
                                <div className={styles.corner}>
                                    <PlsIcon className={styles.deco} aria-hidden="true" />
                                </div>
                                <h3>USR.EMAIL</h3>
                            </motion.div>
                            <motion.div
                                className={styles.cornerTr}
                                custom={{ y: STAGGER.DEFAULT * 200 }}
                                variants={cornerVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                            >
                                <div className={styles.corner}>
                                    <PlsIcon className={styles.deco} aria-hidden="true" />
                                </div>
                            </motion.div>
                            <motion.div
                                className={styles.cornerBl}
                                custom={{ y: -STAGGER.DEFAULT * 200 }}
                                variants={cornerVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                            >
                                <div className={styles.corner}>
                                    <PlsIcon className={styles.deco} aria-hidden="true" />
                                </div>
                                <TypewriterText lines={CORNER_BL_LINES} rowClassName={styles.logRow} />
                            </motion.div>
                            <motion.div
                                className={styles.cornerBr}
                                custom={{ y: -STAGGER.DEFAULT * 200 }}
                                variants={cornerVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                            >
                                <div className={styles.corner}>
                                    <PlsIcon className={styles.deco} aria-hidden="true" />
                                </div>
                            </motion.div>
                            <motion.div
                                className={styles.statusGridWrapper}
                                initial={{ opacity: 0 }}
                                animate={{
                                    opacity: 1,
                                    transition: {
                                        delay: REVEAL.MEDIUM_DURATION + 4 * STAGGER.PAGE,
                                        duration: REVEAL.QUICK_DURATION,
                                        ease: EASING.EMPHASIZED,
                                    },
                                }}
                                exit={{
                                    opacity: 0,
                                    transition: {
                                        duration: REVEAL.EXIT_DURATION,
                                        ease: EASING.EXIT,
                                    },
                                }}
                            >
                                <TypewriterText
                                    lines={STATUS_GRID_LINES}
                                    className={styles.statusGrid}
                                    rowClassName={styles.logRow}
                                    delay={(REVEAL.MEDIUM_DURATION + 4 * STAGGER.PAGE) * 1000}
                                />
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {phase !== 'message' && (
                        <motion.div className={statusFormClass} variants={statusFormVariants} initial="hidden" animate="visible" exit="exit">
                            <motion.div className={styles.statusFormContent} variants={statusFormContentVariants}>
                                {isIntercept && (
                                    <>
                                        <MsgIcon className={styles.mailIcon} aria-hidden="true" />
                                        <PlsIcon className={styles.deco} aria-hidden="true" />
                                        <input
                                            className={styles.mailInput}
                                            placeholder="IDENTIFY"
                                            value={formData.email}
                                            onChange={handleInputChange('email')}
                                            onKeyDown={handleEmailKeyDown}
                                            disabled={glitching}
                                        />
                                        <PlsIcon className={styles.deco} aria-hidden="true" />
                                        <RadGridTxt />
                                    </>
                                )}
                                {phase === 'complete' && (
                                    <>
                                        <ChkIcon className={styles.mailIcon} aria-hidden="true" />
                                        <span className={styles.completeMessage}>MSG.RELAYED</span>
                                    </>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </ErrorBoundary>
    );
}
