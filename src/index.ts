import { IMocks } from '@graphql-tools/mock';
import { createMockHandler, HandleRequest } from './utils/createMockHandler';
import { createMockServer, MockServer } from './createMockServer';
import { mergeMocks } from './utils/mergeMocks';
import { setupWorker, Worker } from './utils/setupWorker';
import { DefaultMocks } from './types';

export type MockNetworkArgs = {
  schema: string;
  mocks?: DefaultMocks;
};

export class MockNetwork {
  private mockServer: MockServer;
  private worker: Worker;
  private schema: string;
  private mocks: IMocks;
  private defaultMocks: IMocks;

  constructor({ schema, mocks: initialMocks = {} }: MockNetworkArgs) {
    const mocks = initialMocks;
    this.mockServer = createMockServer({ schema, mocks });
    this.defaultMocks = mocks;
    this.mocks = mocks;
    this.schema = schema;
    this.worker = setupWorker(createMockHandler(this.handleRequest));
  }

  private recreateMockServer(newMocks: IMocks) {
    this.mocks = newMocks;
    this.mockServer = createMockServer({
      schema: this.schema,
      mocks: this.mocks,
    });
  }

  private handleRequest: HandleRequest = (query, variables) => {
    return this.mockServer.query(query, variables);
  };

  start() {
    return this.worker.start();
  }

  stop() {
    this.worker.stop();
    this.worker = setupWorker(createMockHandler(this.handleRequest));
  }

  addMocks(mocks: IMocks) {
    this.recreateMockServer(mergeMocks([this.mocks, mocks]));
  }

  resetMocks() {
    this.recreateMockServer(this.defaultMocks);
  }
}
