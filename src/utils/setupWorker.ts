import { HandlerResponse } from './createMockHandler';

export type Worker = {
  start: () => void;
  stop: () => void;
};

const IS_NODE = typeof window === 'undefined' || typeof process === 'object';

export const setupWorker = (handlers: HandlerResponse): Worker => {
  if (IS_NODE) {
    const { setupServer } = require('msw/node');
    const server = setupServer(handlers);

    return {
      start: () => server.listen(),
      stop: () => server.close(),
    };
  } else {
    const { setupWorker } = require('msw');
    return setupWorker(handlers);
  }
};
