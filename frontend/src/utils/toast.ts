
import { toast as sonnerToast } from 'sonner';

type ToastType = 'success' | 'error' | 'info' | 'warning';

export const showToast = (message: string, type: ToastType = 'info') => {
  switch (type) {
    case 'success':
      sonnerToast.success(message);
      break;
    case 'error':
      sonnerToast.error(message);
      break;
    case 'warning':
      sonnerToast.warning(message);
      break;
    case 'info':
    default:
      sonnerToast.info(message);
      break;
  }
};

// Export the toast object directly for convenience
export const toast = sonnerToast;

export default sonnerToast;
