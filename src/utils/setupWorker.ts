import { HandlerResponse } from './createMockHandler';

export type Worker = {
  start: () => Promise<void>;
  stop: () => void;
};

export const setupWorker = (handlers: HandlerResponse): Worker => {
  if (process.env.TARGET === 'web') {
    const { setupWorker } = require('msw');
    return setupWorker(handlers);
  } else {
    const { setupServer } = require('msw/node');
    const server = setupServer(handlers);

    return {
      start: () => server.listen(),
      stop: () => server.close(),
    };
  }
};
