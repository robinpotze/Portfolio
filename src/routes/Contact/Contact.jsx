import TypewriterText from '@components/effects/TypewriterText/TypewriterText';
import ErrorBoundary from '@components/ErrorBoundary';
import { CONTACT_TIMING, EASING, REVEAL, STAGGER } from '@config/animation.config';
import { motion } from 'framer-motion';
import RadGridTxt from '../../components/decoration/RadialText/TXT/RAD_GRID_TXT';
import StatusMessage from '../../components/ui/StatusMessage/StatusMessage';
import './Contact.css';

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

export default function Contact () {
    return (
        <ErrorBoundary>
            <div className='contact-page'>
                <StatusMessage status='error' message={<>CONNECTION<br />INTERRUPTED</>} />
                <TypewriterText
                    lines={ERROR_LOG_LINES}
                    className='contact-errorlog'
                    rowClassName='contact-log-row'
                />
                <motion.div
                    className='contact-corner-tl'
                    custom={{ y: STAGGER.DEFAULT * 200 }}
                    variants={cornerVariants}
                    initial='hidden'
                    animate='visible'
                >
                    <div className='contact-corner'>
                        <img className='contact-deco' src='img/icon/PLS.svg' alt='contact form corner plus icon'/>
                    </div>
                    <h3 className='contact-title-txt'>CNTCT-FRM</h3>
                </motion.div>
                <motion.div
                    className='contact-corner-tr'
                    custom={{ y: STAGGER.DEFAULT * 200 }}
                    variants={cornerVariants}
                    initial='hidden'
                    animate='visible'
                >
                    <div className='contact-corner'>
                        <img className='contact-deco' src='img/icon/PLS.svg' alt='contact form corner plus icon'/>
                    </div>
                </motion.div>
                <motion.div
                    className='contact-form'
                    variants={formVariants}
                    initial='hidden'
                    animate='visible'
                >
                    <motion.div
                        className='contact-formContent'
                        variants={formContentVariants}
                        initial='hidden'
                        animate='visible'
                    >
                        <img className='contact-mail-icon' src='img/icon/MSG.svg' alt='contact form mail icon' />
                        <img className='contact-deco' src='img/icon/PLS.svg' alt='contact form decoration icon' />
                        <input className='contact-name-input' placeholder='IDENTIFY' />
                        <img className='contact-deco' src='img/icon/PLS.svg' alt='contact form decoration icon' />
                        <RadGridTxt />
                    </motion.div>
                </motion.div>
                <motion.div
                    className='contact-corner-bl'
                    custom={{ y: -STAGGER.DEFAULT * 200 }}
                    variants={cornerVariants}
                    initial='hidden'
                    animate='visible'
                >
                    <div className='contact-corner'>
                        <img className='contact-deco' src='img/icon/PLS.svg' alt='contact form corner plus icon'/>
                    </div>
                    <TypewriterText
                        lines={['SNR: 32dB | BER: 1e-9 | FRAME_LOCK: TRUE \nSIG_INT: ACTIVE | BUFFER: 0%']}
                        className='contact-bottomlog'
                        rowClassName='contact-log-row'
                    />
                </motion.div>
                <motion.div
                    className='contact-corner-br'
                    custom={{ y: -STAGGER.DEFAULT * 200 }}
                    variants={cornerVariants}
                    initial='hidden'
                    animate='visible'
                >
                    <div className='contact-corner'>
                        <img className='contact-deco' src='img/icon/PLS.svg' alt='contact form corner plus icon'/>
                    </div>
                </motion.div>
                <TypewriterText
                    lines={STATUS_GRID_LINES}
                    className='contact-statusgrid'
                    rowClassName='contact-log-row'
                />
            </div>
        </ErrorBoundary>
    );
}