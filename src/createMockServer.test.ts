import * as fs from 'fs';
import * as path from 'path';
import { createMockServer } from './createMockServer';

const schema = fs.readFileSync(
  path.resolve(__dirname, '../introspection.schema.graphql'),
  'utf8'
);

describe('createMockServer', () => {
  it('creates a new mock server', () => {
    const server = createMockServer({ schema });

    expect(server).toHaveProperty('query');
  });

  it('provides an auto-mocked server given the provided schema', async () => {
    const server = createMockServer({
      schema,
    });

    const res = await server.query(
      `
      query todo($id: ID!) {
        todo(id: $id) {
          id
          title
        }
      }
    `,
      {
        id: 1,
      }
    );

    expect(res).toHaveProperty('data.todo.id');
    expect(res).toHaveProperty('data.todo.title');
    expect(typeof res.data?.todo?.id).toBe('string');
    expect(typeof res.data?.todo?.title).toBe('string');
  });

  it('allows manual mocking of queries when providing a custom mock', async () => {
    const server = createMockServer({
      schema,
      mocks: {
        Query: {
          todo: () => ({
            id: 'xyz',
            title: 'I am manually mocked!',
          }),
        },
      },
    });

    const res = await server.query(
      `
      query todo($id: ID!) {
        todo(id: $id) {
          id
          title
        }
      }
    `,
      {
        id: 1,
      }
    );

    expect(res).toEqual({
      data: {
        todo: {
          id: 'xyz',
          title: 'I am manually mocked!',
        },
      },
    });
  });

  it('preserves auto-mocking when providing manual mocks', async () => {
    const server = createMockServer({
      schema,
      mocks: {
        Query: {
          todo: () => ({
            id: 'xyz',
            title: 'I am manually mocked!',
          }),
        },
      },
    });

    const res = await server.query(
      `
      query photo($id: ID!) {
        photo(id: $id) {
          id
          title
        }
      }
    `,
      {
        id: 1,
      }
    );

    expect(res).toHaveProperty('data.photo.id');
    expect(res).toHaveProperty('data.photo.title');
    expect(typeof res.data?.photo?.id).toBe('string');
    expect(typeof res.data?.photo?.title).toBe('string');
  });

  it('applies query arguments to a mock', async () => {
    const mockArgs = jest.fn();
    const server = createMockServer({
      schema,
      mocks: {
        Query: {
          todo: (_: any, args: {}) => {
            mockArgs(args);
            return {
              id: 'xyz',
              title: 'I am manually mocked!',
            };
          },
        },
      },
    });

    await server.query(
      `
      query todo($id: ID!) {
        todo(id: $id) {
          id
          title
        }
      }
    `,
      {
        id: 'some-id',
      }
    );

    expect(mockArgs).toHaveBeenCalledWith({ id: 'some-id' });
  });

  it('applies query arguments to a mock when nested queries used', async () => {
    const mockArgs = jest.fn();
    const mockNestedArgs = jest.fn();
    const server = createMockServer({
      schema,
      mocks: {
        Query: {
          todo: (_: any, args: {}) => {
            mockArgs(args);
            return {
              id: 'xyz',
              title: 'I am manually mocked!',
              user: (nestedArgs: {}) => {
                mockNestedArgs(nestedArgs);
                return {
                  id: 'some-user-id',
                };
              },
            };
          },
        },
      },
    });

    await server.query(
      `
      query todo($id: ID!, $userId: String) {
        todo(id: $id) {
          id
          title
          user(id: $userId) {
            id
          }
        }
      }
    `,
      {
        id: 'some-id',
        userId: 'some-user-id',
      }
    );

    expect(mockArgs).toHaveBeenCalledWith({ id: 'some-id' });
    expect(mockNestedArgs).toHaveBeenCalledWith({ id: 'some-user-id' });
  });

  it('applies mocked scalars only when fields are not mocked', async () => {
    const server = createMockServer({
      schema,
      mocks: {
        ID: () => 'MOCKED_ID_SCALAR',
        Query: {
          todos: () => ({
            data: [{ id: '123' }, {}, { id: '456' }],
          }),
        },
      },
    });

    const res = await server.query(
      `
      query todos {
        todos {
          data {
            id
          }
        }
      }
    `,
      {
        id: 1,
      }
    );

    expect(res.data).toEqual({
      todos: {
        data: [{ id: '123' }, { id: 'MOCKED_ID_SCALAR' }, { id: '456' }],
      },
    });
  });
});
