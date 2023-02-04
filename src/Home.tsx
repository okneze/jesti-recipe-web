import React from 'react';
import { Link } from 'react-router-dom';

function Home({sheets}: {sheets: string[]}) {
  return (
    <ul>
      {sheets.map((sheet) => (
        <li>
        <Link to={`/sheet/${sheet}`}>{sheet}</Link>
        </li>
      ))}
    </ul>
  );
}

export default Home;