import React from "react";
import English from './english';
import German from './german';

export default function Flag({code}: {code: string}) {
    switch(code) {
        case "english":
            return (<English />);
        default:
            return (<German />);
    }
}
