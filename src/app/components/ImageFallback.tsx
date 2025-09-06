import Image, { ImageProps } from "next/image";
import { useState } from "react";

export default function ImageFallback({src, children, ...props}: {src: string} & ImageProps) {
    const [source, setSource] = useState(src);
    const fallback = () => {
        setSource("");
    }
    return (
        <>
            {source.length > 1 ? <Image onError={fallback} src={source} {...props} /> : <>{children}</>}
        </>
    );
}
