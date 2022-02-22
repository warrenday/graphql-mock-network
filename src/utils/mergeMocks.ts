import { IMocks } from '@graphql-tools/mock';
import { mergeResolvers } from '@graphql-tools/merge';

export const mergeMocks = (mocks: IMocks[]): IMocks => {
  return mergeResolvers(mocks as {});
};
