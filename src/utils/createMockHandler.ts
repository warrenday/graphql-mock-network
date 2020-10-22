import { ExecutionResult } from 'graphql';
import {
  graphql,
  RequestHandler,
  GraphQLMockedRequest,
  GraphQLMockedContext,
} from 'msw';

export type HandleRequest = (
  query: string,
  variables: Record<string, any>
) => Promise<ExecutionResult<{ [key: string]: any }>>;

export type HandlerResponse = RequestHandler<
  GraphQLMockedRequest<Record<string, any>>,
  GraphQLMockedContext<unknown>
>;

export const createMockHandler = (
  handleRequest: HandleRequest
): HandlerResponse => {
  const handler = graphql.operation(async (req, res, ctx) => {
    const { body } = req;
    if (!body) {
      throw new Error('Request body missing');
    }

    const payload = await handleRequest(body.query, req.variables);

    if (payload.errors) {
      return res(ctx.errors([...payload.errors]));
    }
    return res(ctx.data(payload.data));
  });

  return handler;
};
