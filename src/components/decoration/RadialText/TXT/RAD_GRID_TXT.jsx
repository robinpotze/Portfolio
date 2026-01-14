import useRandomNumber from "@hooks/useRandomNumber";

import RAD_TXT from "./RAD_TXT";

import '../RadialGrid.css';

export default function RAD_GRID_TXT() {
    return (
        <div className="rad-grid" id="rad-grid-txt">
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
};