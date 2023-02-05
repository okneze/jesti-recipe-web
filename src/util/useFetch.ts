import { useMemo, useState } from "react";
import Sheetdata from "./Sheetdata";

export const useFetch = (paths: string[]) => {
  const [data, setData] = useState<Sheetdata[]>([])
  useMemo(() => {
    paths.forEach((path) => {
      fetch(`/raw/${path}`)
      .then((text) => text.text())
      .then((res) => {setData(prev => [...prev, new Sheetdata(path, res)])})
      .catch((x) => console.error(x));
    })
  }, [paths]);
  return [data];
};
