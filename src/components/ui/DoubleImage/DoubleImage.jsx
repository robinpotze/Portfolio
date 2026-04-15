import DashLine from '@components/decoration/DashLine';

import styles from './DoubleImage.module.css';

export default function DoubleImage({ images }) {
    return (
        <div className={styles.wrapper}>
            <img src={images[0].src} alt={images[0].alt} />
            <DashLine direction="Vertical" />
            <img src={images[1].src} alt={images[1].alt} />
        </div>
    );
}
