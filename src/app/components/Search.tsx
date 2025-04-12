'use client'

import React from 'react';
import { ChangeEvent, KeyboardEvent } from 'react';
import { redirect } from 'next/navigation';
import { useSearchContext } from '@/app/context/search';
import styles from '@/app/styles/Search.module.css';

export default function Search() {
    const [searchString, setSearchString] = useSearchContext();

    function change(event: ChangeEvent<HTMLInputElement>) {
        return setSearchString(event.target.value);
    }

    function submit(event: KeyboardEvent<HTMLInputElement>) {
        if(event.key === 'Enter') {
            redirect("/");
        }
    }

    return (
        <label>
            <span className="sr-only">Search</span>
            <input onChange={change} onKeyDown={submit} value={searchString} className={styles.searchbar} />
        </label>
    );
}