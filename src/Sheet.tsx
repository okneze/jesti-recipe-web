import React, {useState, useEffect} from 'react';

function Sheet({path}: {path: string}) {
  const [rawSheet, setRawSheet] = useState<string>("");

  // load the raw sheet
  useEffect(() => {
    fetchFile();
  }, []);
  function fetchFile() {
    fetch(`/raw/${path}`)
      .then((text) => text.text())
      .then((res) => setRawSheet(res))
      .catch((x) => console.error(x));
  }

  return (
    <div>
      {rawSheet}
    </div>
  );
}

export default Sheet;