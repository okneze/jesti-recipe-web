import React from "react";
import { useEffect, useState } from "react";
import { Marked, MarkedExtension } from "marked";

export function useMarkdown(markdown: string, options?: MarkedExtension): [string, React.Dispatch<React.SetStateAction<MarkedExtension | undefined>>] {
  const [output, setOutput] = useState("");
  const [opt, setOptions] = useState(options);

  const [marked, setMarked] = useState(new Marked({...opt}));

  useEffect(() => {
    setMarked(new Marked({...opt}));
  }, [opt]);

  useEffect(() => {
    const parsedDescription = marked.parse(markdown);
    if(typeof parsedDescription === 'string') {
      setOutput(parsedDescription);
    } else {
      parsedDescription.then((value) => {
        setOutput(value);
      })
    }
  }, [markdown, marked, opt]);
  return [output, setOptions];
};