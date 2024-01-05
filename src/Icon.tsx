import React from "react";

import {ReactComponent as AlbumSVG} from "./assets/icons/album.svg";
import {ReactComponent as UkuleleSVG} from "./assets/icons/ukulele.svg";
import {ReactComponent as WohldenbergSVG} from "./assets/icons/wohldenberg.svg";
import {ReactComponent as PlusSVG} from "./assets/icons/plus.svg";
import {ReactComponent as MinusSVG} from "./assets/icons/minus.svg";
import styles from "./styles/Icon.module.css";

export class Icon {
    private icons: Record<string, React.ReactNode> = {};

    constructor() {
        this.icons["album"] = <AlbumSVG className={styles.icon} />;
        this.icons["ukulele"] = <UkuleleSVG className={styles.icon} />;
        this.icons["wohldenberg"] = <WohldenbergSVG className={styles.icon} />;
        this.icons["plus"] = <PlusSVG />;
        this.icons["minus"] = <MinusSVG />;
    }

    get(name: string) {
        if(Object.keys(this.icons).includes(name)) {
            return this.icons[name];
        }
        return (<></>);
    }
}