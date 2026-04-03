import RadialGridCircle from './CRCL/RAD_GRID_CRCL';
import RadialGridText from './TXT/RAD_GRID_TXT';

import './RadialGrid.css';

export default function RadialGrid({ type }) {
    switch (type) {
        case 'CRCL':
            return <RadialGridCircle />;
        case 'TXT':
            return <RadialGridText />;
        default:
            return null;
    }
}
