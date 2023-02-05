import React, {useState, useEffect} from 'react';
import styles from './styles/Sheet.module.css'
import Sheetdata from './util/Sheetdata';

function Sheet({data}: {data: Sheetdata}) {

  document.title = `Delyrium - ${data.title} - ${data.artist}`;

  return (
    <div>
      {data.id}
      {data.title}
    </div>
  );
}

export default Sheet;