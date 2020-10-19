import { IMocks } from 'graphql-tools';

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

const mergeResolvers = (resolvers: Record<string, {}>[]) => {
  let topLevelResolvers: { [key: string]: {} } = {};

  resolvers.map(resolver => {
    const entries = Object.entries(resolver);

    entries.forEach(([key, internalResolvers]) => {
      topLevelResolvers[key] = {
        ...(topLevelResolvers[key] || {}),
        ...internalResolvers,
      };
    });
  });

  return topLevelResolvers;
};

export const mergeMocks = (mocks: IMocks[]): IMocks => {
  const topLevelMocks = mocks.map(mock => {
    return executeTopLevelMock(mock);
  });

  const mergedResolvers = mergeResolvers(topLevelMocks);
  return wrapTopLevelMock(mergedResolvers);
};
