import { createContext, useContext, useState, useCallback } from 'react';

const LoadingContext = createContext(null);

export function LoadingProvider({ children }) {
  const [visible, setVisible] = useState(false);

  const showLoader = useCallback((onDone) => {
    setVisible(true);
    // reuse same timing as intro: 3.4s hold → 0.5s fade → done
    setTimeout(() => setVisible(false), 3400);
    if (onDone) setTimeout(onDone, 3900);
  }, []);

  return (
    <LoadingContext.Provider value={{ visible, setVisible, showLoader }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  return useContext(LoadingContext);
}
