import useRandomNumber from '@hooks/useRandomNumber';

import RAD_CRCL from './RAD_CRCL';

import styles from '../RadialGrid.module.css';

export default function RAD_GRID_CRCL() {
    return (
        <div className={styles.gridCrcl}>
            <RAD_CRCL value={useRandomNumber(45, 360)} />
            <RAD_CRCL value={useRandomNumber(45, 360)} />
            <RAD_CRCL value={useRandomNumber(45, 360)} />
            <RAD_CRCL value={useRandomNumber(45, 360)} />
            <RAD_CRCL value={useRandomNumber(45, 360)} />
            <RAD_CRCL value={useRandomNumber(45, 360)} />
            <RAD_CRCL value={useRandomNumber(45, 360)} />
            <RAD_CRCL value={useRandomNumber(45, 360)} />
            <RAD_CRCL value={useRandomNumber(45, 360)} />
        </div>
    );
}
