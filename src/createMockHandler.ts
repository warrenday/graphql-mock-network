import { graphql } from 'msw';

export type HandleRequest = (
  query: string,
  variables: Record<string, any>
) => Promise<{ data?: Record<string, any> | null }>;

export const createMockHandler = (handleRequest: HandleRequest) => {
  const handler = graphql.operation(async (req, res, ctx) => {
    const { body } = req;
    if (!body) {
      throw new Error('Request body missing');
    }

    const payload = await handleRequest(body.query, req.variables);

    return res(ctx.data(payload.data));
  });

  return handler;
};

/*

cypress API

const graphqlMockStart = (schemaPath, mocks) => {
  setupWorker(
    mockGraphqlApi({
      schemaPath,
      mocks
    })
  );
};

const graphqlMockEnd = () => {
  server.close()
}


beforeAll(() => {
  cy.graphqlMockStart(schemaPath, ...optionalMocks);
});

afterAll(() => {
  cy.graphqlMockEnd();
});

it('shows the success notification when form is submitted', () => {
  cy.graphqlMockAdd({ ...mocks });
})

*/
