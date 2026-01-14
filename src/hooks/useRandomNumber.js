import { useEffect, useState } from "react";

export default function useRandomNumber(min, max) {
    const [randomNumber, setRandomNumber] = useState(() => Math.floor(Math.random() * (max - min + 1)) + min);

    useEffect(() => {
        const interval = setInterval(() => {
            setRandomNumber(Math.floor(Math.random() * (max - min + 1)) + min);
        }, 856);
        return () => clearInterval(interval);
    }, [min, max]);

    return randomNumber;
}