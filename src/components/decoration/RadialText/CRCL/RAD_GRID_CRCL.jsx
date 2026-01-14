import useRandomNumber from "@hooks/useRandomNumber";

import RAD_CRCL from "./RAD_CRCL";

import '../RadialGrid.css';


export default function RAD_GRID_CRCL() {
    return (
        <div className="rad-grid" id="rad-grid-crcl">
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
};