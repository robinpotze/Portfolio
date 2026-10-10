export const CONTACT_FORM_URL = 'https://contact-form.robinpotze.workers.dev';

export const AVAILABILITY_LINES = ['STATUS: AVAILABLE', 'TYPE: FULL-TIME / FREELANCE'];

export const REPLY_ETA = 'REPLY ETA: 2–3 WORKING DAYS';

export const SEND_ERROR_CONFIG = {
    400: {
        status: 'error',
        message: (
            <>
                INVALID
                <br />
                IDENT
            </>
        ),
    },
    405: {
        status: 'error',
        message: (
            <>
                ROUTE
                <br />
                BLOCKED
            </>
        ),
    },
    500: {
        status: 'error',
        message: (
            <>
                SERVER
                <br />
                FAULT
            </>
        ),
    },
    502: {
        status: 'error',
        message: (
            <>
                MAIL
                <br />
                UNREACH
            </>
        ),
    },
    network: {
        status: 'error',
        message: (
            <>
                LINK
                <br />
                LOST
            </>
        ),
    },
    default: {
        status: 'error',
        message: (
            <>
                RELAY
                <br />
                FAILED
            </>
        ),
    },
};

export function getSendErrorConfig(status) {
    if (typeof status !== 'number') {
        return SEND_ERROR_CONFIG.network;
    }

    return SEND_ERROR_CONFIG[status] ?? SEND_ERROR_CONFIG.default;
}

export const PHASE_CONFIG = {
    message: {
        statusType: null,
        statusMessage: null,
    },
    intercept: {
        statusType: 'error',
        statusMessage: (
            <>
                RETURN ADDRESS
                <br />
                MISSING
            </>
        ),
    },
    complete: {
        statusType: 'success',
        statusMessage: (
            <>
                TRANSMISSION
                <br />
                RECEIVED
            </>
        ),
    },
};

export const ERROR_LOG_LINES = [
    '[SYSTEM] PACKET_VALIDATOR v2.1.0',
    '[RECV] INBOUND MESSAGE FROM CNTCT-FRM',
    '[RECV] ROUTE: PUBLIC_UPLINK -> RELAY_01',
    '\n',
    '[CHECK] HEADER ............ OK',
    '[CHECK] SENDER_ID ......... OK',
    '[CHECK] PAYLOAD ........... OK',
    '[CHECK] CHECKSUM .......... OK',
    '[CHECK] RETURN_ADDRESS .... MISSING',
    '\n',
    '[ROUTE] RESOLVING REPLY PATH...',
    '[ROUTE] NO RETURN_ADDRESS ON FILE',
    '[HALT] CANNOT ROUTE REPLY',
    '\n',
    '[REQ] SUPPLY RETURN_ADDRESS TO CONTINUE',
    '[REQ] FORMAT: USER@DOMAIN.TLD',
    '\n',
    '[STATUS] PACKET HELD IN BUFFER',
    '[SYSTEM] AWAITING INPUT...',
];

export const STATUS_GRID_LINES = [
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

export const CORNER_BL_LINES = ['SNR: 32dB | BER: 1e-9 | FRAME_LOCK: TRUE \nSIG_INT: ACTIVE | BUFFER: 0%'];
