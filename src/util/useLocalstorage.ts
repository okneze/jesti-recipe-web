import { useEffect, useState } from "react";

export default function<T>(name: string, value: T): [T, (i: T) => void] {
    const [item, setItem] = useState(() => {
        return JSON.parse(localStorage.getItem(name) ?? "false") as T || value;
    });
    useEffect(() => {
        localStorage.setItem(name, JSON.stringify(item));
    }, [item]);
    return [item, setItem];
}
