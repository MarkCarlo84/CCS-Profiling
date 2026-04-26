import { useState, useEffect, useRef, useMemo } from 'react';

export default function VirtualList({ items, itemHeight, renderItem, containerHeight = 600, overscan = 3 }) {
    const [scrollTop, setScrollTop] = useState(0);
    const containerRef = useRef(null);

    const totalHeight = items.length * itemHeight;

    const visibleRange = useMemo(() => {
        const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
        const visibleCount = Math.ceil(containerHeight / itemHeight);
        const end = Math.min(items.length, start + visibleCount + overscan * 2);
        return { start, end };
    }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

    const visibleItems = useMemo(() => {
        return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
            item,
            index: visibleRange.start + index,
        }));
    }, [items, visibleRange]);

    const handleScroll = (e) => {
        setScrollTop(e.target.scrollTop);
    };

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            style={{
                height: containerHeight,
                overflow: 'auto',
                position: 'relative',
            }}
        >
            <div style={{ height: totalHeight, position: 'relative' }}>
                {visibleItems.map(({ item, index }) => (
                    <div
                        key={index}
                        style={{
                            position: 'absolute',
                            top: index * itemHeight,
                            height: itemHeight,
                            width: '100%',
                        }}
                    >
                        {renderItem(item, index)}
                    </div>
                ))}
            </div>
        </div>
    );
}
