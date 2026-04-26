import React from 'react';

const shimmer = {
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
    borderRadius: 6,
};

// Inject keyframes once
if (typeof document !== 'undefined' && !document.getElementById('skeleton-style')) {
    const style = document.createElement('style');
    style.id = 'skeleton-style';
    style.textContent = `@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`;
    document.head.appendChild(style);
}

function Box({ width = '100%', height = 16, style = {} }) {
    return <div style={{ ...shimmer, width, height, ...style }} />;
}

export function SkeletonStatCards({ count = 5 }) {
    return (
        <div className="stats-row">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="stat-card" style={{ gap: 14 }}>
                    <Box width={50} height={50} style={{ borderRadius: 13, flexShrink: 0 }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <Box width="60%" height={12} />
                        <Box width="40%" height={22} />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function SkeletonTable({ rows = 6, cols = 5 }) {
    return (
        <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header">
                <Box width={180} height={18} />
                <Box width={60} height={18} />
            </div>
            <div className="card-body" style={{ padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            {Array.from({ length: cols }).map((_, i) => (
                                <th key={i} style={{ padding: '10px 14px' }}>
                                    <Box width="80%" height={12} />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: rows }).map((_, r) => (
                            <tr key={r} style={{ borderTop: '1px solid #f5f5f4' }}>
                                {Array.from({ length: cols }).map((_, c) => (
                                    <td key={c} style={{ padding: '12px 14px' }}>
                                        <Box width={c === 0 ? '30%' : c === cols - 1 ? '50%' : '75%'} height={13} />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function SkeletonCards({ count = 4 }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} style={{ padding: '14px 16px', border: '1px solid #f0f0f0', borderRadius: 10, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <Box width={40} height={40} style={{ borderRadius: '50%', flexShrink: 0 }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <Box width="55%" height={14} />
                        <Box width="80%" height={12} />
                        <Box width="40%" height={11} />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function SkeletonDashboard() {
    return (
        <div>
            <SkeletonStatCards count={5} />
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-header">
                    <Box width={200} height={16} />
                </div>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '16px 20px' }}>
                    {[70, 50, 30].map((w, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <Box width={32} height={32} style={{ borderRadius: 9, flexShrink: 0 }} />
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <Box width={`${w}%`} height={12} />
                                <Box width="100%" height={5} style={{ borderRadius: 3 }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Box;
