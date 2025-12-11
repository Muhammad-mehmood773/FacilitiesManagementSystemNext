import { toast } from 'react-toastify';

export const successToast = (msg: string) =>
  toast.success(msg, {
    position: 'top-right',
    autoClose: 1500,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    theme: 'light',
  });

export const errorToast = (msg: string) =>
  toast.error(msg, {
    position: 'top-right',
    autoClose: 1500,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    theme: 'colored',
  });
