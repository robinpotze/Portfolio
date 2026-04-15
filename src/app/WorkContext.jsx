import { createContext, useContext } from 'react';

const WorkContext = createContext(null);

export function useWorkItems() {
    const context = useContext(WorkContext);
    if (!context) {
        throw new Error('useWorkItems must be used within App');
    }
    return context;
}

export default WorkContext;
