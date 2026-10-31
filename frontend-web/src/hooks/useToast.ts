    import { useContext } from 'react';
    import { ToastContext } from '../components/Toast/ToastProvider';

    export default function useToast() {
        const ctx = useContext(ToastContext);
        if (!ctx) {
            throw new Error('useToast должен использоваться внутри <ToastProvider>');
        }
        return ctx;
    }