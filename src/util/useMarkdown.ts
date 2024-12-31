import { Marked, MarkedExtension } from "marked";
import React, { useEffect, useRef, useState } from "react";

export function useMarkdown<T extends HTMLElement>(markdown: string, options?: MarkedExtension): React.RefObject<T> {
  const ref = useRef<T>(null);

  const [marked] = useState(options ? new Marked(options) : new Marked());

  useEffect(() => {
    if(ref.current) {
      const parsedDescription = marked.parse(markdown);
      if(typeof parsedDescription === 'string') {
        ref.current.innerHTML = parsedDescription;
      } else {
        parsedDescription.then((value) => {
          if(ref.current) {
            ref.current.innerHTML = value;
          }
        })
      }
    }
  }, [ref, markdown, options, marked]);
  return ref;
};
