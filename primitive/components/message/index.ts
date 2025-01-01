import { message } from './message';

export { GlobalMessageContainer } from './container';
export { MessageContainer as ToastContainer } from './container';

export type MessageHandle = ReturnType<typeof message>;

export { message };
