import { useState } from 'react';
import styles from './Work.module.css';

/** Work's DOM overlay; the carousel itself lives in the shared Home/Work canvas. */
export default function Work() {
    const [isTouchDevice] = useState(() => 'ontouchstart' in window);
    return isTouchDevice ? <p className={styles.touchHint}>Swipe to browse</p> : null;
}
