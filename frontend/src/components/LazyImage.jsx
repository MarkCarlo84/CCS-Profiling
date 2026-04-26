import { useState, useEffect, useRef } from 'react';

export default function LazyImage({ src, alt, placeholder, ...props }) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const imgRef = useRef(null);

    useEffect(() => {
        if (!imgRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '50px' }
        );

        observer.observe(imgRef.current);

        return () => observer.disconnect();
    }, []);

    return (
        <img
            ref={imgRef}
            src={isInView ? src : placeholder}
            alt={alt}
            onLoad={() => setIsLoaded(true)}
            style={{
                opacity: isLoaded ? 1 : 0.5,
                transition: 'opacity 0.3s ease-in-out',
            }}
            {...props}
        />
    );
}
