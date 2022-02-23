import { IMocks, IMockStore } from '@graphql-tools/mock';

type IMockResolver = (
  store: IMockStore,
  args: Record<string, unknown>
) => unknown;

export interface IMockPayload extends IMocks {
  Query?: {
    [key: string]: IMockResolver;
  };
  Mutation?: {
    [key: string]: IMockResolver;
  };
}
