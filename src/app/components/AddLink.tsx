'use client'

import Link from "next/link";
import PlusSVG from "../svg/fontawesome/plus";
import styles from "@/app/styles/AddLink.module.css";

export default function AddLink() {
    return (
        <Link 
            href="https://kaimak.knezevic.de" 
            title="Add new content" 
            className={styles.link}
            target="_self"
        >
            <PlusSVG />
        </Link>
    );
}