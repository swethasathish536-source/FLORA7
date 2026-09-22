import React, { useState, useEffect } from 'react';
import { getCategoryFallback } from '../utils/imageUtils';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  category?: string;
  fallbackText?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt = 'Satin Rose Bouquet',
  category,
  className = '',
  ...rest
}) => {
  const defaultFallback = getCategoryFallback(category, alt);
  const [imgSrc, setImgSrc] = useState<string>(src || defaultFallback);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src || defaultFallback);
    setHasError(false);
  }, [src, category, alt]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(defaultFallback);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      loading="lazy"
      referrerPolicy="no-referrer"
      {...rest}
    />
  );
};
