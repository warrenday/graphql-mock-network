import { IMocks, IMockServer } from 'graphql-tools';
import {
  createMockHandler,
  HandleRequest,
  HandlerResponse,
} from './utils/createMockHandler';
import { createMockServer } from './createMockServer';
import { mergeMocks } from './utils/mergeMocks';
import { setupWorker } from './utils/setupWorker';

export type Worker = (
  handlers: HandlerResponse
) => {
  listen: () => void;
  close: () => void;
};

export type MockNetworkArgs = {
  schemaPath: string;
  mocks: IMocks;
};

export class MockNetwork {
  public mockServer: IMockServer;
  public worker: ReturnType<Worker>;
  public schemaPath: string;
  public mocks: IMocks;
  public defaultMocks: IMocks;

  constructor({ schemaPath, mocks = {} }: MockNetworkArgs) {
    this.mockServer = createMockServer({ schemaPath, mocks });
    this.defaultMocks = mocks;
    this.mocks = mocks;
    this.schemaPath = schemaPath;
    this.worker = setupWorker(createMockHandler(this.handleRequest));
  }

  public recreateMockServer(newMocks: IMocks) {
    this.mocks = newMocks;
    this.mockServer = createMockServer({
      schemaPath: this.schemaPath,
      mocks: this.mocks,
    });
  }

  public handleRequest: HandleRequest = (query, variables) => {
    return this.mockServer.query(query, variables);
  };

  listen() {
    return this.worker.listen();
  }

  close() {
    return this.worker.close();
  }

  addMocks(mocks: IMocks) {
    this.recreateMockServer(mergeMocks([this.mocks, mocks]));
  }

  resetMocks() {
    this.recreateMockServer(this.defaultMocks);
  }
}
