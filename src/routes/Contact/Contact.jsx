import ErrorBoundary from '@components/ErrorBoundary';
import './Contact.css';
import RAD_GRID_TXT from '../../components/decoration/RadialText/TXT/RAD_GRID_TXT';

export default function Contact () {
    return (
        <ErrorBoundary>
            <div className='contact-page'>
                <div className='contact-form'>
                    <img className='contact-mail-icon' src='img/icon/MAL.svg'/>
                    <img className='contact-deco' src='img/icon/CRS.svg' />
                    <input className='contact-name-input' placeholder='IDENTIFY'/>
                    <img className='contact-deco' src='img/icon/CRS.svg' />
                    <RAD_GRID_TXT />
                </div>
            </div>
        </ErrorBoundary>
    );
}