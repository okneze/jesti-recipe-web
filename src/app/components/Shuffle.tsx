'use client'

import { useSeedContext } from "../context/seed";
import ShuffleSVG from "../svg/fontawesome/shuffle";
import styles from "@/app/styles/Shuffle.module.css";

export default function Randomize() {
    const [, setSeed] = useSeedContext();
    function shuffle() {
        setSeed(Math.random());
    }
    return <button onClick={shuffle} title="Shuffle" className={styles.button}><ShuffleSVG /></button>;
}