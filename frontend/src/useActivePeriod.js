import { useState, useEffect } from 'react';
import api from './api';

export function useActivePeriod() {
    const [period, setPeriod] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/academic-period/active')
            .then(r => setPeriod(r.data))
            .catch(() => setPeriod(null))
            .finally(() => setLoading(false));
    }, []);

    return { period, loading };
}
