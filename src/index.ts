import { setupServer } from 'msw/node';
import { IMocks } from 'graphql-tools';
import { createMockHandler, HandleRequest } from './createMockHandler';
import { createMockServer } from './createMockServer';
import { mergeMocks } from './mergeMocks';

export type MockServerArgs = {
  schemaPath: string;
  mocks: IMocks;
};

export class MockServer {
  private mockServer;
  private server;
  private schemaPath;
  private mocks: IMocks;
  private defaultMocks: IMocks;

  constructor({ schemaPath, mocks = {} }: MockServerArgs) {
    this.mockServer = createMockServer({ schemaPath, mocks });
    this.defaultMocks = mocks;
    this.mocks = mocks;
    this.schemaPath = schemaPath;

    this.server = setupServer(createMockHandler(this.handleRequest));
  }

  private recreateMockServer(newMocks: IMocks) {
    this.mocks = newMocks;
    this.mockServer = createMockServer({
      schemaPath: this.schemaPath,
      mocks: this.mocks,
    });
  }

  private handleRequest: HandleRequest = (query, variables) => {
    return this.mockServer.query(query, variables);
  };

  listen() {
    return this.server.listen();
  }

  close() {
    return this.server.close();
  }

  addMocks(mocks: IMocks) {
    this.recreateMockServer(mergeMocks([this.mocks, mocks]));
  }

  resetMocks() {
    this.recreateMockServer(this.defaultMocks);
  }
}
