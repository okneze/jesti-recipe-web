'use client'

import {useState, useEffect} from 'react';

export function useLocalStorage<T>(key: string, defaultValue: T) {
    const [value, setStoredValue] = useState(defaultValue);
    useEffect(() => {
        const stored = localStorage.getItem(key);
        if(stored) {
            setStoredValue(JSON.parse(stored));
        }
    }, [key]);

    function setValue(value: T) {
        setStoredValue(value);
        localStorage.setItem(key, JSON.stringify(value));
    }

    return [value, setValue] as const;
}
