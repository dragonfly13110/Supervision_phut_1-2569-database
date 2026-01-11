import { useState, useRef, useEffect } from 'react';

interface LazyImageProps {
    src: string;
    alt: string;
    className?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
    placeholder?: React.ReactNode;
}

export function LazyImage({ src, alt, className = '', style, onClick, placeholder }: LazyImageProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsInView(true);
                        observer.disconnect();
                    }
                });
            },
            { threshold: 0.1, rootMargin: '50px' }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const handleLoad = () => {
        setIsLoaded(true);
    };

    const handleError = () => {
        setHasError(true);
        setIsLoaded(true);
    };

    return (
        <div
            ref={imgRef}
            className={`lazy-image-container ${className}`}
            style={style}
            onClick={onClick}
        >
            {/* Placeholder */}
            {!isLoaded && (
                <div className="lazy-image-placeholder">
                    {placeholder || (
                        <div className="lazy-image-spinner">
                            <div className="spinner"></div>
                        </div>
                    )}
                </div>
            )}

            {/* Actual image - only load when in view */}
            {isInView && !hasError && (
                <img
                    src={src}
                    alt={alt}
                    className={`lazy-image ${isLoaded ? 'loaded' : ''}`}
                    onLoad={handleLoad}
                    onError={handleError}
                />
            )}

            {/* Error state */}
            {hasError && (
                <div className="lazy-image-error">
                    <span>⚠️</span>
                    <span>โหลดรูปไม่สำเร็จ</span>
                </div>
            )}
        </div>
    );
}
