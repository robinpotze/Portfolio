import ErrorBoundary from '@components/ErrorBoundary';
import './Contact.css';
import RAD_GRID_TXT from '../../components/decoration/RadialText/TXT/RAD_GRID_TXT';

export default function Contact () {
    return (
        <ErrorBoundary>
            <div className='contact-page'>
                <div className='contact-corner-tl'>
                    <div className='contact-corner'>
                        <img className='contact-deco' src='img/icon/PLS.svg' alt='contact form corner plus icon'/>
                    </div>
                    <h3 className='contact-title-txt'>CNTCT-FRM</h3>
                </div>
                <div className='contact-corner-tr'>
                    <div className='contact-corner'>
                        <img className='contact-deco' src='img/icon/PLS.svg' alt='contact form corner plus icon'/>
                    </div>
                </div>
                <div className='contact-form'>
                    <img className='contact-mail-icon' src='img/icon/MSG.svg' alt='contact form mail icon'/>
                    <img className='contact-deco' src='img/icon/PLS.svg' alt='contact form decoration icon'/>
                    <input className='contact-name-input' placeholder='IDENTIFY'/>
                    <img className='contact-deco' src='img/icon/PLS.svg' alt='contact form decoration icon'/>
                    <RAD_GRID_TXT />
                </div>
                <div className='contact-corner-bl'>
                    <div className='contact-corner'>
                        <img className='contact-deco' src='img/icon/PLS.svg' alt='contact form corner plus icon'/>
                    </div>
                    <span className='contact-bottomlog'>SNR: 32dB | BER: 1e-9 | FRAME_LOCK: TRUE <br /> SIG_INT: ACTIVE | BUFFER: 0%</span>
                </div>
                <div className='contact-corner-br'>
                    <div className='contact-corner'>
                        <img className='contact-deco' src='img/icon/PLS.svg' alt='contact form corner plus icon'/>
                    </div>
                </div>
                <div className='contact-statusgrid'>
                    <span className='contact-statusgrid-text'>
                        [UPLINK_MONITOR] FREQ: 5.825GHz | MODE: WIDEBAND_DIVERSITY
                        <br /><br />
                        SIGNAL_CH A1 . . . . . [LOCKED]     SIGNAL_CH B1 . . . . . [LOCKED] <br />
                        SIGNAL_CH A2 . . . . . [ACQUIRED]   SIGNAL_CH B2 . . . . . [STABLE] <br />
                        SIGNAL_CH A3 . . . . . [PHASE_OK]   SIGNAL_CH B3 . . . . . [BIT_SYNC] <br />
                        SIGNAL_CH A4 . . . . . [PARITY_OK]  SIGNAL_CH B4 . . . . . [STREAMING] <br />
                        SIGNAL_CH A5 . . . . . [BUFFER]     SIGNAL_CH B5 . . . . . [ACTIVE] <br />
                        <br /><br />
                        [PARITY: VALID] [FRAME_ALIGN: TRUE] [UPLINK: ACTIVE]
                    </span>
                </div>
            </div>
        </ErrorBoundary>
    );
}