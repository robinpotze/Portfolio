import RadGridTxt from '@components/decoration/RadialText/TXT/RAD_GRID_TXT';
import TypewriterText from '@components/effects/TypewriterText';
import ErrorBoundary from '@components/ErrorBoundary';
import StatusMessage from '@components/ui/StatusMessage/StatusMessage';
import { CONTACT_TIMING, EASING, REVEAL, STAGGER } from '@config/animation.config';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useRef, useState } from 'react';
import { CORNER_BL_LINES, DEFAULT_ICONS, ERROR_LOG_LINES, INTERCEPT_ICONS, STATUS_GRID_LINES } from './contact.data';
import styles from './Contact.module.css';

const PHASE_CONFIG = {
    message: {
        titleClass: styles.messageTitle,
        formClass: styles.messageForm,
        statusFormClass: styles.statusForm,
        statusType: null,
        statusMessage: null,
    },
    intercept: {
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
        duration: CONTACT_TIMING.PHASE_TRANSITION_DURATION,
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
            duration: CONTACT_TIMING.FORM_DURATION,
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
            delay: CONTACT_TIMING.FORM_CONTENT_DELAY,
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
            delay: CONTACT_TIMING.CORNER_DELAY,
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
            duration: CONTACT_TIMING.FORM_DURATION,
            ease: EASING.EMPHASIZED,
            staggerChildren: CONTACT_TIMING.FORM_STAGGER,
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
            duration: CONTACT_TIMING.FIELD_DURATION,
            ease: EASING.EMPHASIZED,
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
    const { titleClass, formClass, statusFormClass, statusType, statusMessage } = activeConfig;

    const canSend = formData.name.trim() !== '' && formData.message.trim() !== '';
    const canIdentify = formData.email.trim() !== '';

    const icons = isIntercept ? INTERCEPT_ICONS : DEFAULT_ICONS;

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
            }, CONTACT_TIMING.GLITCH_DURATION_MS);
        }
    }, [canSend, glitching]);

    const handleIdentify = useCallback(() => {
        if (canIdentify) {
            setPhase('complete');
        }
    }, [canIdentify]);

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
                                    values="0;60;0;45;0;30;0;55;0;20;0"
                                    keyTimes="0;0.08;0.16;0.28;0.38;0.50;0.60;0.72;0.82;0.92;1"
                                    dur="0.8s"
                                    begin="indefinite"
                                    fill="freeze"
                                />
                            </feDisplacementMap>
                        </filter>
                    </defs>
                </svg>
                <motion.h2 className={titleClass}>CNTCT-FRM</motion.h2>

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
                                <img className={styles.fieldCornerTL} src={icons.pls} alt="" />
                                <img className={styles.fieldCornerTR} src={icons.pls} alt="" />
                                <img className={styles.fieldMarker} src={icons.crs} alt="" />
                                <img className={styles.nameIcon} src={icons.msg} alt="" />
                                <input
                                    className={styles.nameInput}
                                    placeholder="USR.NAME"
                                    value={formData.name}
                                    onChange={handleInputChange('name')}
                                    disabled={showIntercept}
                                />
                                <img className={styles.fieldCornerBL} src={icons.pls} alt="" />
                                <img className={styles.fieldCornerBR} src={icons.pls} alt="" />
                            </motion.div>
                            <motion.div className={styles.messageField} variants={fieldVariants}>
                                <img className={styles.fieldCornerTL} src={icons.pls} alt="" />
                                <img className={styles.fieldCornerTR} src={icons.pls} alt="" />
                                <img className={styles.fieldMarker} src={icons.crs} alt="" />
                                <div className={styles.messageSideBar}>
                                    <img className={styles.messageIcon} src={icons.msg} alt="" />
                                    <img className={styles.decal} src={icons.decal} alt="" />
                                </div>
                                <textarea
                                    className={styles.messageInput}
                                    placeholder="MSG.PAYLOAD"
                                    value={formData.message}
                                    onChange={handleInputChange('message')}
                                    disabled={showIntercept}
                                />
                                <img className={styles.fieldCornerBL} src={icons.pls} alt="" />
                                <img className={styles.fieldCornerBR} src={icons.pls} alt="" />
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
                    {(phase !== 'message' || glitching) && (
                        <motion.div
                            className={styles.errorSection}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, transition: { duration: REVEAL.EXIT_DURATION, ease: EASING.EXIT } }}
                        >
                            <StatusMessage status={statusType} message={statusMessage} />
                            {showIntercept && (
                                <TypewriterText lines={ERROR_LOG_LINES} className={styles.errorlog} rowClassName={styles.logRow} />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {showIntercept && (
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
                                    <img className={styles.deco} src="img/icon/PLS_DRK.svg" alt="" />
                                </div>
                                <h3>CNTCT-FRM</h3>
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
                                    <img className={styles.deco} src="img/icon/PLS_DRK.svg" alt="" />
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
                                    <img className={styles.deco} src="img/icon/PLS_DRK.svg" alt="" />
                                </div>
                                <TypewriterText
                                    lines={CORNER_BL_LINES}
                                    rowClassName={styles.logRow}
                                />
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
                                    <img className={styles.deco} src="img/icon/PLS_DRK.svg" alt="" />
                                </div>
                            </motion.div>
                            <TypewriterText lines={STATUS_GRID_LINES} className={styles.statusGrid} rowClassName={styles.logRow} />
                        </>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {(phase !== 'message' || glitching) && (
                        <motion.div
                            className={glitching ? styles.statusFormGlitch : statusFormClass}
                            variants={statusFormVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <motion.div className={styles.statusFormContent} variants={statusFormContentVariants}>
                                {showIntercept && (
                                    <>
                                        <img className={styles.mailIcon} src="img/icon/MSG_DRK.svg" alt="" />
                                        <img className={styles.deco} src="img/icon/PLS_DRK.svg" alt="" />
                                        <input
                                            className={styles.mailInput}
                                            placeholder="IDENTIFY"
                                            value={formData.email}
                                            onChange={handleInputChange('email')}
                                            onKeyDown={handleEmailKeyDown}
                                            disabled={glitching}
                                        />
                                        <img className={styles.deco} src="img/icon/PLS_DRK.svg" alt="" />
                                        <RadGridTxt />
                                    </>
                                )}
                                {phase === 'complete' && (
                                    <>
                                        <img className={styles.mailIcon} src="img/icon/CHK_DRK.svg" alt="" />
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
