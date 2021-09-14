import { IMocks } from '@graphql-tools/mock';
import { getIsObjectWithFunctions } from './getIsObjectWithFunctions';

const unwrapTopLevelMock = (mock: IMocks) => {
  let executedMocks: Record<string, {}> = {};
  for (let key in mock) {
    const mockFn = mock[key];
    if (typeof mockFn === 'function') {
      executedMocks[key] = mockFn();
    } else {
      executedMocks[key] = mockFn as {};
    }
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

  resolvers.forEach((resolver) => {
    const entries = Object.entries(resolver);

    entries.forEach(([key, resolverValue]) => {
      // getIsObjectWithFunctions helps differentiate between top level mocks or scalars/custom types
      // Query: { todo: () => {} } | ID: () => 200
      if (getIsObjectWithFunctions(resolverValue)) {
        topLevelResolvers[key] = {
          ...(topLevelResolvers[key] || {}),
          ...resolverValue,
        };
      } else {
        topLevelResolvers[key] = resolverValue;
      }
    });
  });

  return topLevelResolvers;
};

export const mergeMocks = (mocks: IMocks[]): IMocks => {
  const topLevelMocks = mocks.map((mock) => {
    return unwrapTopLevelMock(mock);
  });

  const mergedResolvers = mergeResolvers(topLevelMocks);
  return wrapTopLevelMock(mergedResolvers);
};
