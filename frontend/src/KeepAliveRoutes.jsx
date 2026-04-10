import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * KeepAliveRoutes renders all matched route components once and keeps them
 * mounted, toggling visibility via CSS. Pages load on first visit and are
 * never unmounted on navigation.
 */
export default function KeepAliveRoutes({ routes }) {
  const location = useLocation();
  const [visited, setVisited] = useState({});
  const currentPath = location.pathname;

  // Normalize: strip trailing slash except for root
  const normalize = (p) => (p !== '/' ? p.replace(/\/$/, '') : p);
  const active = normalize(currentPath);

  // Match a route path against the current path
  const matchRoute = (routePath) => {
    const norm = normalize(routePath);
    return norm === active;
  };

  // Mark current route as visited on navigation
  useEffect(() => {
    const matched = routes.find((r) => matchRoute(r.path));
    if (matched) {
      setVisited((prev) => ({ ...prev, [matched.path]: true }));
    }
  }, [active]);

  return (
    <>
      {routes.map(({ path, element }) => {
        const isActive = matchRoute(path);
        const hasVisited = visited[path] || isActive;

        if (!hasVisited) return null;

        return (
          <div
            key={path}
            style={{ display: isActive ? 'contents' : 'none' }}
          >
            {element}
          </div>
        );
      })}
    </>
  );
}
