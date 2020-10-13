import fs from 'fs';
import { buildClientSchema, IntrospectionQuery, GraphQLSchema } from 'graphql';
import { mockServer, IMockServer, IMocks } from 'graphql-tools';

type CreateMockServerArgs = {
  schemaPath: string;
  mocks?: IMocks;
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
    return (schema as unknown) as GraphQLSchema;
  }
  return buildClientSchema(
    (getJsonOrString(schema) as unknown) as IntrospectionQuery
  );
};

export const createMockServer = ({
  schemaPath,
  mocks = {},
}: CreateMockServerArgs): IMockServer => {
  const schemaString = fs.readFileSync(schemaPath, 'utf8');
  const schema = getGraphqlSchema(schemaString);
  return mockServer(schema, mocks);
};
