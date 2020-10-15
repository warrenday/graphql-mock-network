import { mergeResolvers, IMocks } from 'graphql-tools';

const executeTopLevelMock = (mock: IMocks) => {
  let executedMocks: Record<string, {}> = {};
  for (let key in mock) {
    const mockFn: any = mock[key];
    executedMocks[key] = mockFn();
  }
  return executedMocks;
};

const wrapTopLevelMock = (mock: Record<string, {}>): IMocks => {
  let wrappedMock: IMocks = {};
  for (let key in mock) {
    wrappedMock[key] = () => mock[key];
  }
  return wrappedMock;
};

export const mergeMocks = (mocks: IMocks[]): IMocks => {
  let mockObjects = mocks.map(mock => {
    return executeTopLevelMock(mock);
  });
  const resolvers = mergeResolvers(mockObjects);
  return wrapTopLevelMock(resolvers);
};
