import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useState } from 'react';

import SnDecal from '@/assets/decals/SN.svg?react';
import ChkIcon from '@/assets/icons/CHK.svg?react';
import MsgIcon from '@/assets/icons/MSG.svg?react';
import PlsIcon from '@/assets/icons/PLS.svg?react';
import ErrorBoundary from '@components/ErrorBoundary';
import ActionButton from '@components/ui/ActionButton/ActionButton';
import BannerCorner from '@components/ui/BannerCorner/BannerCorner';
import GlitchOverlay from '@components/ui/GlitchOverlay/GlitchOverlay';
import RadGridTxt from '@components/ui/RadialText/TXT/RAD_GRID_TXT';
import StatusMessage from '@components/ui/StatusMessage/StatusMessage';
import StatusPanel from '@components/ui/StatusPanel/StatusPanel';
import TextArea from '@components/ui/TextArea/TextArea';
import TextInput from '@components/ui/TextInput/TextInput';
import TypewriterText from '@components/ui/TypewriterText';
import { EASING, REVEAL, STAGGER, TIMEOUT } from '@config/animation.config';

import { CONTACT_FORM_URL, CORNER_BL_LINES, ERROR_LOG_LINES, getSendErrorConfig, PHASE_CONFIG, STATUS_GRID_LINES } from './contact.data.jsx';
import styles from './Contact.module.css';

const TITLE_LABELS = {
    message: 'CNTCT-FRM',
    intercept: 'WDBND-PKT_DE-ENCAP',
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

const formVariants = {
    hidden: {
        opacity: 0,
        scaleX: 0,
    },
    visible: {
        opacity: 1,
        scaleX: 1,
        transition: {
            delay: STAGGER.PAGE,
            duration: REVEAL.DURATION,
            ease: EASING.EMPHASIZED,
            delayChildren: STAGGER.PAGE,
            staggerChildren: STAGGER.PAGE,
        },
    },
    exit: {
        opacity: 0,
        scaleY: 0,
        transition: {
            duration: REVEAL.MEDIUM_DURATION,
            ease: EASING.EXIT,
        },
    },
};

export default function Contact() {
    // State
    const [phase, setPhase] = useState('message');
    const [formData, setFormData] = useState({
        name: '',
        message: '',
        email: '',
    });
    const [glitching, setGlitching] = useState(false);
    const [sendError, setSendError] = useState(null);
    const [statusMessageKey, setStatusMessageKey] = useState(0);

    // Derived values
    const isIntercept = phase === 'intercept';
    const showIntercept = isIntercept || glitching;
    const canSend = formData.name.trim() !== '' && formData.message.trim() !== '';
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

    const currentPhase = glitching ? 'intercept' : phase;
    const { statusType, statusMessage } = PHASE_CONFIG[currentPhase];
    const titleClass = currentPhase === 'intercept' ? styles.titleIntercept : styles.title;
    const titleLabel = TITLE_LABELS[currentPhase];
    const formClass = glitching ? styles.formGlitch : isIntercept ? styles.formIntercept : styles.form;

    // Callbacks
    const onInputChange = useCallback(
        (field) => (e) => {
            setFormData((prev) => ({ ...prev, [field]: e.target.value }));
        },
        []
    );

    const onIdentify = useCallback(async () => {
        setSendError(null);
        try {
            const res = await fetch(CONTACT_FORM_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const payload = await res.json().catch(() => null);

            if (!res.ok) {
                throw Object.assign(new Error(payload?.error ?? 'SEND_FAILED'), {
                    status: res.status,
                });
            }
            setPhase('complete');
        } catch (err) {
            setSendError(getSendErrorConfig(err.status));
            setStatusMessageKey((prev) => prev + 1);
        }
    }, [formData]);

    const onSend = useCallback(() => {
        if (!isIntercept && !glitching && canSend) {
            setGlitching(true);
            setTimeout(() => {
                setPhase('intercept');
                setGlitching(false);
            }, TIMEOUT.GLITCH_DURATION_MS);
        } else if (isIntercept && !glitching && isValidEmail) {
            onIdentify();
        }
    }, [isIntercept, glitching, canSend, isValidEmail, onIdentify]);

    const onEmailKeyDown = useCallback(
        (e) => {
            if (e.key === 'Enter') {
                onIdentify();
            }
        },
        [onIdentify]
    );

    return (
        <ErrorBoundary>
            <div className={`${styles.page} ${glitching ? styles.pageGlitch : ''}`}>
                <GlitchOverlay active={glitching} />

                {/* Title */}
                <AnimatePresence>
                    {phase !== 'complete' && (
                        <motion.h2 className={titleClass} variants={titleVariants} initial="hidden" animate="visible" exit="exit">
                            {titleLabel}
                        </motion.h2>
                    )}
                </AnimatePresence>

                {/* Form Fields */}
                <AnimatePresence>
                    {phase !== 'complete' && (
                        <motion.div className={formClass} variants={formVariants} initial="hidden" animate="visible" exit="exit">
                            <TextInput
                                placeholder="USR.NAME"
                                value={formData.name}
                                onChange={onInputChange('name')}
                                disabled={showIntercept}
                                variant={showIntercept ? 'intercept' : 'default'}
                            />
                            <TextArea
                                placeholder="MSG.PAYLOAD"
                                value={formData.message}
                                onChange={onInputChange('message')}
                                disabled={showIntercept}
                                variant={showIntercept ? 'intercept' : 'default'}
                                decal={<SnDecal />}
                            />
                            <ActionButton
                                onClick={onSend}
                                disabled={!canSend || glitching || (isIntercept && !isValidEmail)}
                                icon="format_text_overflow"
                            >
                                MSG.SEND
                            </ActionButton>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Intercept Corners */}
                <AnimatePresence>
                    {phase !== 'message' && (
                        <>
                            <motion.div
                                className={styles.errorArea}
                                initial={{ opacity: 1 }}
                                animate={{ opacity: 1 }}
                                exit={{
                                    opacity: 0,
                                    transition: {
                                        duration: REVEAL.EXIT_DURATION,
                                        ease: EASING.EXIT,
                                    },
                                }}
                            >
                                <StatusMessage
                                    key={sendError ? `send-error-${statusMessageKey}` : 'status'}
                                    status={sendError?.status ?? statusType}
                                    message={sendError?.message ?? statusMessage}
                                    delay={REVEAL.MEDIUM_DURATION + 2 * STAGGER.PAGE}
                                />
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

                            {isIntercept && (
                                <>
                                    <BannerCorner position="tl" icon={PlsIcon} className={styles.cornerTlArea}>
                                        <h3>USR.EMAIL</h3>
                                    </BannerCorner>
                                    <BannerCorner position="tr" icon={PlsIcon} className={styles.cornerTrArea} />
                                    <BannerCorner position="bl" icon={PlsIcon} className={styles.cornerBlArea}>
                                        <TypewriterText lines={CORNER_BL_LINES} rowClassName={styles.logRow} />
                                    </BannerCorner>
                                    <BannerCorner position="br" icon={PlsIcon} className={styles.cornerBrArea} />

                                    <motion.div
                                        className={styles.statusGridArea}
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
                        </>
                    )}
                </AnimatePresence>

                {/* Status Panel */}
                <AnimatePresence>
                    {phase !== 'message' && (
                        <StatusPanel className={styles.statusPanelArea} variant={phase === 'complete' ? 'success' : 'default'}>
                            {isIntercept && (
                                <>
                                    <MsgIcon className={styles.panelIcon} aria-hidden="true" />
                                    <PlsIcon className={styles.panelDeco} aria-hidden="true" />
                                    <input
                                        className={`${styles.panelInput} ${formData.email && !isValidEmail ? styles.panelInputInvalid : ''}`}
                                        placeholder="IDENTIFY@DOMAIN.COM"
                                        type="email"
                                        value={formData.email}
                                        onChange={onInputChange('email')}
                                        onKeyDown={onEmailKeyDown}
                                        disabled={glitching}
                                    />
                                    <PlsIcon className={styles.panelDeco} aria-hidden="true" />
                                    <RadGridTxt />
                                </>
                            )}
                            {phase === 'complete' && (
                                <>
                                    <ChkIcon className={styles.panelIcon} aria-hidden="true" />
                                    <span className={styles.completeMessage}>MSG.RELAYED</span>
                                </>
                            )}
                        </StatusPanel>
                    )}
                </AnimatePresence>
            </div>
        </ErrorBoundary>
    );
}
