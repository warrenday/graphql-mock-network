import {
  graphql,
  buildClientSchema,
  GraphQLSchema,
  ExecutionResult,
  IntrospectionQuery,
} from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { addMocksToSchema } from '@graphql-tools/mock';
import { DefaultMocks } from './types';

type CreateMockServerArgs = {
  schema: string;
  mocks?: DefaultMocks;
};

export type MockServer = {
  query: (
    query: string,
    variables: {}
  ) => Promise<ExecutionResult<{ [key: string]: any }>>;
};

const getJsonOrString = (jsonOrString: string): string | IntrospectionQuery => {
  try {
    return JSON.parse(jsonOrString);
  } catch (e) {
    return jsonOrString;
  }
};

const getGraphqlSchema = (schemaString: string): GraphQLSchema => {
  const schema = getJsonOrString(schemaString);
  if (typeof schema === 'string') {
    return makeExecutableSchema({ typeDefs: schema });
  }
  return buildClientSchema(schema);
};

export const createMockServer = ({
  schema,
  mocks = {},
}: CreateMockServerArgs): MockServer => {
  // Apply Query and Mutation to resolvers so they have access
  // to query args. Apply the rest (Scalars) as general mocks.
  const { Query = {}, Mutation = {}, ...rest } = mocks;

  const graphqlSchema = getGraphqlSchema(schema);
  const schemaWithMocks = addMocksToSchema({
    schema: graphqlSchema,
    mocks: rest,
    resolvers: {
      Query,
      Mutation,
    },
  });

  return {
    query: (query, variables) => {
      return graphql({
        schema: schemaWithMocks,
        source: query,
        variableValues: variables,
      });
    },
  };
};
