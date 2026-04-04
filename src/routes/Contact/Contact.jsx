import RadGridTxt from '@components/decoration/RadialText/TXT/RAD_GRID_TXT';
import TypewriterText from '@components/effects/TypewriterText';
import ErrorBoundary from '@components/ErrorBoundary';
import StatusMessage from '@components/ui/StatusMessage/StatusMessage';
import { CONTACT_TIMING, EASING, REVEAL, STAGGER } from '@config/animation.config';
import { motion } from 'framer-motion';
import styles from './Contact.module.css';

const ERROR_LOG_LINES = [
    '[SYSTEM] CARRIER_INTERCEPT_DAEMON v9.4.0',
    '[BOOT] WIDEBAND_FRONTEND: ACTIVE [RX_01..RX_08]',
    '[SCAN] SPECTRUM_SWEEP: 5725MHz - 5875MHz',
    '[SYNC] CARRIER_LOCKED: 5.821GHz [UPLINK_SIG]',
    '[LINK] RSSI: -38dBm | SNR: 34.2dB | BER: <1e-12',
    '\n',
    '[LAYER_1] BITSTREAM_EXTRACTION...',
    '0x001: [████████████████] 100% PHASE_LOCK',
    '0x002: [████████████████] 100% CLOCK_REC',
    '0x003: [████████████████] 100% FRAME_SYNC',
    '\n',
    '[LAYER_2] DE-ENCAPSULATION_ROUTINE',
    '[PROC] REMOVING_ETHERNET_PREAMBLE... [DONE]',
    '[PROC] STRIPPING_VLAN_TAGS (ID: 402)... [DONE]',
    '[PROC] MAC_SPOOF_VALIDATION: BYPASSED',
    '\n',
    '[LAYER_3] PACKET_RECONSTRUCTION',
    '[RECV] IPV4_DATAGRAM_TOTAL: 4096 BYTES',
    '[RECV] SOURCE: 172.16.254.1',
    '[RECV] DESTINATION: [PROTECTED_INTERNAL_SRV]',
    '[FRAG] REASSEMBLING_FRAGMENTED_PAYLOAD...',
    '[FRAG] SEGMENT_01..08 [LOCKED]',
    '\n',
    '[LAYER_4] TLS_INTERCEPT_ACTIVE',
    '[AUTH] SESSION_ID: 0xFD291A_XFS',
    '[AUTH] HANDSHAKE_STRATEGY: MAN_IN_THE_MIDDLE',
    '[AUTH] RSA_KEY_INJECTION: SUCCESS',
    '[AUTH] MASTER_SECRET_EXTRACTED: [0x...FF2E]',
    '\n',
    '[L7_DATA] DECRYPTED_STREAM_OUTPUT:',
    '{',
    '  "protocol": "TCP/JSON",',
    '  "endpoint": "/api/v1/secure_contact",',
    '  "payload_size": "2.4kb",',
    '  "intercept": "COMMIT_SUCCESS"',
    '}',
    '\n',
    '[STATUS] SIGNAL_BARRIER: PERMEATED',
    '[STATUS] DATA_FLOW: UNRESTRICTED',
    '[SYSTEM] STANDBY for NEXT_FRAME...',
];

const STATUS_GRID_LINES = [
    '[UPLINK_MONITOR] FREQ: 5.825GHz | MODE: WIDEBAND_DIVERSITY',
    '\n',
    'SIGNAL_CH A1 . . . . . [LOCKED]     SIGNAL_CH B1 . . . . . [LOCKED]',
    'SIGNAL_CH A2 . . . . . [ACQUIRED]   SIGNAL_CH B2 . . . . . [STABLE]',
    'SIGNAL_CH A3 . . . . . [PHASE_OK]   SIGNAL_CH B3 . . . . . [BIT_SYNC]',
    'SIGNAL_CH A4 . . . . . [PARITY_OK]  SIGNAL_CH B4 . . . . . [STREAMING]',
    'SIGNAL_CH A5 . . . . . [BUFFER]     SIGNAL_CH B5 . . . . . [ACTIVE]',
    '\n',
    '[PARITY: VALID] [FRAME_ALIGN: TRUE] [UPLINK: ACTIVE]',
];

const formVariants = {
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
};

const formContentVariants = {
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
};

const nameFieldVariants = {
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

const messageFieldVariants = {
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
    return (
        <ErrorBoundary>
            <div className={styles.page}>
                <motion.h2 className={styles.messageTitle}>CNTCT-FRM</motion.h2>
                <motion.div className={styles.messageForm} variants={messageFormVariants} initial="hidden" animate="visible">
                    <motion.div className={styles.nameField} variants={nameFieldVariants} initial="hidden" animate="visible">
                        <motion.img className={styles.fieldCornerTL} src="img/icon/PLS.svg" alt="contact form corner icon" />
                        <motion.img className={styles.fieldCornerTR} src="img/icon/PLS.svg" alt="contact form corner icon" />
                        <motion.img className={styles.fieldMarker} src="img/icon/CRS.svg" alt="contact form marker icon" />
                        <motion.img className={styles.nameIcon} src="img/icon/SHELL.svg" alt="contact form user icon" />
                        <motion.input className={styles.nameInput} placeholder="USR.NAME" />
                        <motion.img className={styles.fieldCornerBL} src="img/icon/PLS.svg" alt="contact form corner icon" />
                        <motion.img className={styles.fieldCornerBR} src="img/icon/PLS.svg" alt="contact form corner icon" />
                    </motion.div>
                    <motion.div className={styles.messageField} variants={messageFieldVariants} initial="hidden" animate="visible">
                        <motion.img className={styles.fieldCornerTL} src="img/icon/PLS.svg" alt="contact form corner icon" />
                        <motion.img className={styles.fieldCornerTR} src="img/icon/PLS.svg" alt="contact form corner icon" />
                        <motion.img className={styles.fieldMarker} src="img/icon/CRS.svg" alt="contact form marker icon" />
                        <motion.div>
                            <motion.img className={styles.messageIcon} src="img/icon/MSG_BRND.svg" alt="contact form message icon" />
                            <motion.img className={styles.deco} src="img/deco/SINE.svg" alt="contact form decoration icon" />
                        </motion.div>
                        <motion.textarea className={styles.messageInput} placeholder="MSG.PAYLOAD" />
                        <motion.img className={styles.fieldCornerBL} src="img/icon/PLS.svg" alt="contact form corner icon" />
                        <motion.img className={styles.fieldCornerBR} src="img/icon/PLS.svg" alt="contact form corner icon" />
                    </motion.div>
                    <motion.button className={styles.sendButton}>
                        MSG.SEND <span className="material-symbols-sharp">format_text_overflow</span>
                    </motion.button>
                </motion.div>

                <div className={styles.errorSection}>
                    <StatusMessage
                        status="error"
                        message={
                            <>
                                CONNECTION
                                <br />
                                INTERRUPTED
                            </>
                        }
                    />
                    <TypewriterText lines={ERROR_LOG_LINES} className={styles.errorlog} rowClassName={styles.logRow} />
                </div>
                <motion.div
                    className={styles.cornerTl}
                    custom={{ y: STAGGER.DEFAULT * 200 }}
                    variants={cornerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div className={styles.corner}>
                        <img className={styles.deco} src="img/icon/PLS_DRK.svg" alt="contact form corner plus icon" />
                    </div>
                    <h3>CNTCT-FRM</h3>
                </motion.div>
                <motion.div
                    className={styles.cornerTr}
                    custom={{ y: STAGGER.DEFAULT * 200 }}
                    variants={cornerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div className={styles.corner}>
                        <img className={styles.deco} src="img/icon/PLS_DRK.svg" alt="contact form corner plus icon" />
                    </div>
                </motion.div>
                <motion.div className={styles.statusForm} variants={formVariants} initial="hidden" animate="visible">
                    <motion.div className={styles.statusFormContent} variants={formContentVariants} initial="hidden" animate="visible">
                        <img className={styles.mailIcon} src="img/icon/MSG_DRK.svg" alt="contact form mail icon" />
                        <img className={styles.deco} src="img/icon/PLS_DRK.svg" alt="contact form decoration icon" />
                        <input className={styles.mailInput} placeholder="IDENTIFY" />
                        <img className={styles.deco} src="img/icon/PLS_DRK.svg" alt="contact form decoration icon" />
                        <RadGridTxt />
                    </motion.div>
                </motion.div>
                <motion.div
                    className={styles.cornerBl}
                    custom={{ y: -STAGGER.DEFAULT * 200 }}
                    variants={cornerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div className={styles.corner}>
                        <img className={styles.deco} src="img/icon/PLS_DRK.svg" alt="contact form corner plus icon" />
                    </div>
                    <TypewriterText
                        lines={['SNR: 32dB | BER: 1e-9 | FRAME_LOCK: TRUE \nSIG_INT: ACTIVE | BUFFER: 0%']}
                        rowClassName={styles.logRow}
                    />
                </motion.div>
                <motion.div
                    className={styles.cornerBr}
                    custom={{ y: -STAGGER.DEFAULT * 200 }}
                    variants={cornerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div className={styles.corner}>
                        <img className={styles.deco} src="img/icon/PLS_DRK.svg" alt="contact form corner plus icon" />
                    </div>
                </motion.div>
                <TypewriterText lines={STATUS_GRID_LINES} className={styles.statusgrid} rowClassName={styles.logRow} />
            </div>
        </ErrorBoundary>
    );
}
