import { message } from '../components';

export const copy = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    message(`Copy Success!`, { type: 'success' });
  } catch (e) {
    message(`Copy Fail!`, { type: 'error' });
  }
};
