import {
  graphql,
  buildClientSchema,
  GraphQLSchema,
  ExecutionResult,
} from 'graphql';
import {
  IMocks,
  addMockFunctionsToSchema,
  makeExecutableSchema,
} from 'graphql-tools';

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

const getJsonOrString = (jsonOrString: string) => {
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
  addMockFunctionsToSchema({ schema: graphqlSchema, mocks });

  return {
    query: (query, variables) => {
      return graphql({
        schema: graphqlSchema,
        source: query,
        variableValues: variables,
      });
    },
  };
};
