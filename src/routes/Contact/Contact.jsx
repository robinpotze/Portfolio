import ErrorBoundary from '@components/ErrorBoundary';
import './Contact.css';

export default function Contact () {
    return (
        <ErrorBoundary>
            <div className="contact-page">
                <h1>Contact Page</h1>
                <p>This is the contact page.</p>
            </div>
        </ErrorBoundary>
    );
}