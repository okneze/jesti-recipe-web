import React, {useState} from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';

import Sheet from './Sheet';
import Home from './Home';
import data from './sheet_list.json'
function App() {


  const [sheets, setSheets] = useState<string[]>(data.files);
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Home sheets={sheets} />} />
          {sheets.sort().map((sheet) => (
            <Route path={`sheet/${sheet}`} element={<Sheet path={sheet}/>} />
          ))}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
