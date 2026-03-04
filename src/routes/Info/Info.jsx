import ErrorBoundary from '@components/ErrorBoundary';

export default function Info () {
    return (
        <ErrorBoundary>
            <div className="info-page">
                <h1>Info Page</h1>
                <p>This is the info page.</p>
            </div>
        </ErrorBoundary>
    );
}