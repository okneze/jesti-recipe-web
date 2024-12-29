import { Dispatch, SetStateAction, useEffect, useState } from "react";

function useLocalstorage<T>(name: string, value: T): [T, Dispatch<SetStateAction<T>>] {
    const [item, setItem] = useState(() => {
        return JSON.parse(localStorage.getItem(name) ?? "false") as T || value;
    });
    useEffect(() => {
        localStorage.setItem(name, JSON.stringify(item));
    }, [item, name]);
    return [item, setItem];
}

export default useLocalstorage;