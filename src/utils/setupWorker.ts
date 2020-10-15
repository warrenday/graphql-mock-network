import { HandlerResponse } from './createMockHandler';

type Worker = {
  listen: () => void;
  close: () => void;
};

const IS_NODE = typeof window === 'undefined' || typeof process === 'object';

export const setupWorker = (handlers: HandlerResponse): Worker => {
  if (IS_NODE) {
    const { setupServer } = require('msw/node');
    return setupServer(handlers);
  } else {
    const { setupWorker } = require('msw');
    const worker = setupWorker();

    return {
      listen: () => worker.start(),
      close: () => worker.stop(),
    };
  }
};
