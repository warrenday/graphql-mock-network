import {
  graphql,
  buildClientSchema,
  GraphQLSchema,
  ExecutionResult,
  IntrospectionQuery,
} from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { addMocksToSchema, IMocks } from '@graphql-tools/mock';

type CreateMockServerArgs = {
  schema: string;
  mocks?: IMocks;
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
  const graphqlSchema = getGraphqlSchema(schema);
  const schemaWithMocks = addMocksToSchema({
    schema: graphqlSchema,
    mocks,
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
