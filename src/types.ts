import { IMocks } from '@graphql-tools/mock';

type CommonMocks = {
  Query?: {};
  Mutation?: {};
};

export type DefaultMocks = IMocks & CommonMocks;
