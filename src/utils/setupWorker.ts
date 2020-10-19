import { HandlerResponse } from './createMockHandler';

export type Worker = {
  start: () => void;
  stop: () => void;
};

const IS_BROWSER =
  typeof process?.versions?.node === 'undefined' &&
  typeof window !== 'undefined';

export const setupWorker = (handlers: HandlerResponse): Worker => {
  if (IS_BROWSER) {
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
