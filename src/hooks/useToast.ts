import { useState, useCallback } from 'react';

export interface ToastState {
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
}

export const useToast = () => {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    type: 'info',
  });

  const showToast = useCallback((
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'info',
    title?: string
  ) => {
    setToast({
      visible: true,
      message,
      type,
      title,
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

  // Convenience methods
  const showSuccess = useCallback((message: string, title?: string) => {
    showToast(message, 'success', title);
  }, [showToast]);

  const showError = useCallback((message: string, title?: string) => {
    showToast(message, 'error', title);
  }, [showToast]);

  const showWarning = useCallback((message: string, title?: string) => {
    showToast(message, 'warning', title);
  }, [showToast]);

  const showInfo = useCallback((message: string, title?: string) => {
    showToast(message, 'info', title);
  }, [showToast]);

  return {
    toast,
    showToast,
    hideToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};
