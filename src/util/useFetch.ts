import { useMemo, useState } from "react";
import {SheetType, parseSheet} from "./Sheetdata";

export const useFetch = (paths: string[]) => {
  const [data, setData] = useState<SheetType[]>([])
  useMemo(() => {
    paths.forEach((path) => {
      fetch(`/raw/${path}`)
      .then((text) => text.text())
      .then((res) => {setData(prev => [...prev, parseSheet(path, res)])})
      .catch((x) => console.error(x));
    })
  }, [paths]);
  return [data];
};
