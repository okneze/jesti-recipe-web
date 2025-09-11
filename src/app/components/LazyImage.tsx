'use client'

import { useState, useEffect, useRef, ReactNode } from 'react';
import Image, { ImageProps } from 'next/image';

interface LazyImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  children: ReactNode;
  delay?: number; // Delay in ms after intersection before loading image
}

export default function LazyImage({ 
  src, 
  children, 
  alt, 
  delay = 100,
  ...props 
}: LazyImageProps) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [imageSource, setImageSource] = useState('');
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer to detect when image enters viewport
  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px' // Start loading 50px before entering viewport
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, []);

  // Delayed loading after intersection
  useEffect(() => {
    if (!isIntersecting || !src) return;

    const timer = setTimeout(() => {
      setImageSource(src);
      setShouldLoad(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [isIntersecting, src, delay]);

  const handleError = () => {
    setHasError(true);
    setImageSource('');
  };

  return (
    <div ref={imgRef}>
      {shouldLoad && imageSource && !hasError ? (
        <Image
          src={imageSource}
          alt={alt}
          onError={handleError}
          {...props}
        />
      ) : (
        <>{children}</>
      )}
    </div>
  );
}