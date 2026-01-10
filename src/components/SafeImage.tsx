import { Image as MantineImage } from '@mantine/core';
import { useState, useEffect } from 'react';

interface SafeImageProps {
  src?: string | null;
  fallbackSrc?: string;
  fallbackContent?: React.ReactNode;
  height?: number | string;
  width?: number | string;
  alt?: string;
  style?: React.CSSProperties;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function SafeImage({ 
  src, 
  fallbackSrc = "/placeholder-poster.svg", 
  fallbackContent,
  height,
  width,
  alt,
  style,
  className,
  onLoad,
  onError,
  ...rest
}: SafeImageProps) {
  const [imageError, setImageError] = useState(false);
  const [fallbackError, setFallbackError] = useState(false);

  // Reset errors when src changes
  useEffect(() => {
    setImageError(false);
    setFallbackError(false);
  }, [src]);

  const handleImageError = () => {
    setImageError(true);
    onError?.();
  };

  const handleFallbackError = () => {
    setFallbackError(true);
  };

  const handleImageLoad = () => {
    onLoad?.();
  };

  // Check if src is valid
  const isValidSrc = src && src !== 'N/A' && src.trim() !== '' && src.toLowerCase().startsWith('http');
  
  // If main image failed and fallback failed, show custom content or inline placeholder
  if ((imageError || !isValidSrc) && fallbackError) {
    if (fallbackContent) {
      return <>{fallbackContent}</>;
    }
    
    // Inline placeholder
    return (
      <div 
        className={className}
        style={{ 
          width: width || '100%', 
          height: height || 300, 
          background: 'linear-gradient(135deg, #374151, #1f2937)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9ca3af',
          border: '1px solid #374151',
          borderRadius: '8px',
          ...style
        }}
      >
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎬</div>
        <div style={{ fontSize: '14px', textAlign: 'center', fontWeight: 500 }}>
          No Poster<br />Available
        </div>
      </div>
    );
  }

  // If main image failed or invalid, try fallback
  if (imageError || !isValidSrc) {
    return (
      <MantineImage
        src={fallbackSrc}
        height={height}
        width={width}
        alt={alt || 'Movie poster'}
        style={style}
        className={className}
        onError={handleFallbackError}
        onLoad={handleImageLoad}
        {...rest}
      />
    );
  }

  // Show main image
  return (
    <MantineImage
      src={src}
      height={height}
      width={width}
      alt={alt || 'Movie poster'}
      style={style}
      className={className}
      onError={handleImageError}
      onLoad={handleImageLoad}
      {...rest}
    />
  );
}