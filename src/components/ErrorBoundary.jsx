import { Component } from 'react';
import styles from './ErrorBoundary.module.css';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(_error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // eslint-disable-next-line no-console
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error,
            errorInfo,
        });
    }

    onReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className={styles.container}>
                    <h1 className={styles.title}>Something went wrong</h1>
                    <p className={styles.message}>An unexpected error occurred while rendering this component.</p>
                    <div className={styles.actions}>
                        <button onClick={this.onReset} className={styles.retryButton}>
                            Try Again
                        </button>
                        <a href="/" className={styles.homeLink}>
                            Go Home
                        </a>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
