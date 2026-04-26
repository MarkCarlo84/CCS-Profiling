import { useState, useMemo } from 'react';

export function usePagination(items, itemsPerPage = 10) {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil((items?.length || 0) / itemsPerPage);

    const paginatedItems = useMemo(() => {
        if (!items) return [];
        const start = (currentPage - 1) * itemsPerPage;
        return items.slice(start, start + itemsPerPage);
    }, [items, currentPage, itemsPerPage]);

    const goToPage = (page) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    const nextPage = () => goToPage(currentPage + 1);
    const prevPage = () => goToPage(currentPage - 1);
    const resetPage = () => setCurrentPage(1);

    return {
        currentPage,
        totalPages,
        paginatedItems,
        goToPage,
        nextPage,
        prevPage,
        resetPage,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1,
    };
}
