import { useEffect } from "react";
import useLocalstorage from "./useLocalstorage";
import { SheetList, parseSheet } from "./Sheetdata";

type SheetFileList = {
  sha: string;
  url: string;
  tree: {
    path: string;
    mode: string;
    type: string;
    sha: string;
    size: number;
    url: string;
  }[];
}

export function useFetchSheets(repository: string, branch: string): [SheetList?] {
  const [list, setList] = useLocalstorage<SheetFileList | undefined>("fileList", undefined);
  const [sheets, setSheets] = useLocalstorage<SheetList>("sheets", {});
  const [updated, setUpdated] = useLocalstorage<number>("updated", 0);


  useEffect(() => {
    // Only update once per hour
    if(updated + 1000 * 60 * 60 > Date.now()) {
      return;
    }
    const listURL = `https://api.github.com/repos/${repository}/git/trees/${branch}?recursive=1`;
    fetch(listURL)
    .then((raw) => raw.json())
    .then((result) => {
      if(!list || list.sha !== (result as SheetFileList).sha) {
        // also update all sheets
        (result as SheetFileList).tree.forEach(element => {
          if(element.path.endsWith(".crd") && !list?.tree.findIndex((value) => value.path === element.path && value.sha === element.sha)) {
            const sheetURL = `https://raw.githubusercontent.com/${repository}/${branch}/${element.path}`;
            fetch(sheetURL)
            .then((raw) => raw.text())
            .then((sheet) => {
              const parsed = parseSheet(element.path, sheet);
              setSheets(prev => ({...prev, [parsed.slug]: parsed}));
            });
          }
        });

        setList(result);
        setUpdated(Date.now());
      }
    });
  }, [branch, list, repository, setList, setSheets, setUpdated, updated]);
  return [sheets];
};
