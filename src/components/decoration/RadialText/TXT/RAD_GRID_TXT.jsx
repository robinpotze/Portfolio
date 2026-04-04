import useRandomNumber from '@hooks/useRandomNumber';

import RAD_TXT from './RAD_TXT';

import styles from '../RadialGrid.module.css';

export default function RAD_GRID_TXT() {
    return (
        <div className={styles.gridTxt}>
            <RAD_TXT value={useRandomNumber(45, 360)} />
            <RAD_TXT value={useRandomNumber(45, 360)} />
            <RAD_TXT value={useRandomNumber(45, 360)} />
            <RAD_TXT value={useRandomNumber(45, 360)} />
            <RAD_TXT value={useRandomNumber(45, 360)} />
            <RAD_TXT value={useRandomNumber(45, 360)} />
            <RAD_TXT value={useRandomNumber(45, 360)} />
            <RAD_TXT value={useRandomNumber(45, 360)} />
            <RAD_TXT value={useRandomNumber(45, 360)} />
        </div>
    );
}
