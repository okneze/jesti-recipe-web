import React from "react";

import {ReactComponent as GermanSVG} from "./assets/icons/german.svg";
import {ReactComponent as EnglishSVG} from "./assets/icons/english.svg";
import {ReactComponent as PlusSVG} from "./assets/icons/plus.svg";
import {ReactComponent as MinusSVG} from "./assets/icons/minus.svg";
import {ReactComponent as FoodSVG} from "./assets/icons/food.svg";

export class Icon {
    private icons: Record<string, React.ReactNode> = {};

    constructor() {
        this.icons["german"] = <GermanSVG />;
        this.icons["english"] = <EnglishSVG />;
        this.icons["plus"] = <PlusSVG />;
        this.icons["minus"] = <MinusSVG />;
        this.icons["food"] = <FoodSVG />;
    }

    get(name: string) {
        if(Object.keys(this.icons).includes(name)) {
            return this.icons[name];
        }
        return (<></>);
    }
}