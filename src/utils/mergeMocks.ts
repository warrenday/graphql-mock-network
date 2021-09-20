import { IMockFn, IMocks } from '@graphql-tools/mock';
import { IGraphqlMocks } from '../types';
import { getIsObjectWithFunctions } from './getIsObjectWithFunctions';

const unwrapTopLevelMock = (mock: IGraphqlMocks) => {
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

export const wrapTopLevelMock = (mock: IGraphqlMocks): IMocks => {
  let wrappedMock: IMocks = {};
  for (let key in mock) {
    if (typeof mock[key] === 'function') {
      wrappedMock[key] = mock[key] as IMockFn;
    } else {
      wrappedMock[key] = () => mock[key];
    }
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

export const mergeMocks = (mocks: IGraphqlMocks[]): IMocks => {
  const topLevelMocks = mocks.map((mock) => {
    return unwrapTopLevelMock(mock);
  });

  const mergedResolvers = mergeResolvers(topLevelMocks);
  return wrapTopLevelMock(mergedResolvers);
};
