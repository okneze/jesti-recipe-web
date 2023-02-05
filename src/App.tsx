import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';

import Sheet from './Sheet';
import Home from './Home';
import data from './sheet_list.json'
import { useFetch } from './util/useFetch';
function App() {

  const [sheets] = useFetch(data.files);

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Home sheets={sheets} />} />
          {sheets.map((sheet) => (
            <Route path={`sheet/${sheet.slug}`} element={<Sheet data={sheet}/>} />
          ))}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
