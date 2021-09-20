import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { MockNetwork } from './index';

const rejectTimeout = (ms: number) => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('timeout')), ms);
  });
};

const schema = fs.readFileSync(
  path.resolve(__dirname, '../introspection.schema.graphql'),
  'utf8'
);

const networkRequest = (query: string, variables: object = { id: 1 }) => {
  return axios.post(
    '/graphql',
    {
      query,
      variables,
    },
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
};

const mockNetwork = new MockNetwork({
  schema,
  mocks: {
    Query: {
      todo: () => ({
        id: 'xyz',
        title: 'I am a manually mocked todo!',
      }),
    },
  },
});

describe('MockNetwork', () => {
  beforeEach(() => {
    mockNetwork.resetMocks();
  });

  beforeAll(() => {
    mockNetwork.start();
  });

  afterAll(() => {
    mockNetwork.stop();
  });

  it('mocks a query', async () => {
    const res = await networkRequest(`
      query todo($id: ID!) {
        todo(id: $id) {
          id
          title
        }
      }
    `);

    expect(res.data).toEqual({
      data: {
        todo: {
          id: 'xyz',
          title: 'I am a manually mocked todo!',
        },
      },
    });
  });

  it('mocks a mutation', async () => {
    mockNetwork.addMocks({
      Mutation: () => ({
        createPhoto: () => ({
          id: '1',
          title: 'Family Holiday',
          url: 'http://url.com',
          thumbnailUrl: 'http://url.com/thumbnail',
        }),
      }),
    });

    const res = await networkRequest(
      `
      mutation createPhoto($title: String!, $url: String!, $thumbnailUrl: String!) {
        createPhoto(input: { title: $title, url: $url, thumbnailUrl: $thumbnailUrl }) {
          id
          title
        }
      }
    `,
      {
        title: 'Family Holiday',
        url: 'http://url.com',
        thumbnailUrl: 'http://url.com/thumbnail',
      }
    );

    expect(res.data).toEqual({
      data: {
        createPhoto: {
          id: '1',
          title: 'Family Holiday',
        },
      },
    });
  });

  it('mocks a type/scalar', async () => {
    mockNetwork.addMocks({
      ID: () => '200',
      Query: () => ({
        todo: () => ({
          title: 'I am a manually mocked todo!',
        }),
      }),
    });

    const res = await networkRequest(`
      query todo($id: ID!) {
        todo(id: $id) {
          id
          title
        }
      }
    `);

    expect(res.data).toEqual({
      data: {
        todo: {
          id: '200',
          title: 'I am a manually mocked todo!',
        },
      },
    });
  });

  it('mocks an error', async () => {
    mockNetwork.addMocks({
      Query: () => ({
        photo: () => {
          throw new Error('Oh dear, this is bad');
        },
      }),
    });

    const res = await networkRequest(`
      query photo($id: ID!) {
        photo(id: $id) {
          id
          title
        }
      }
    `);

    expect(res.data.errors).toHaveLength(1);
    expect(res.data.errors[0]).toHaveProperty(
      'message',
      'Oh dear, this is bad'
    );
  });

  it('adds addition mocks', async () => {
    mockNetwork.addMocks({
      Query: () => ({
        photo: () => ({
          id: 'abc',
          title: 'I am a manually mocked photo!',
        }),
      }),
    });

    const res = await networkRequest(`
      query photo($id: ID!) {
        photo(id: $id) {
          id
          title
        }
      }
    `);

    expect(res.data).toEqual({
      data: {
        photo: {
          id: 'abc',
          title: 'I am a manually mocked photo!',
        },
      },
    });
  });

  it('preserves previous mocks when adding new mocks', async () => {
    mockNetwork.addMocks({
      Query: () => ({
        photo: () => ({
          id: 'abc',
          title: 'I am a manually mocked photo!',
        }),
      }),
    });

    const res = await networkRequest(`
      query todo($id: ID!) {
        todo(id: $id) {
          id
          title
        }
      }
    `);

    expect(res.data).toEqual({
      data: {
        todo: {
          id: 'xyz',
          title: 'I am a manually mocked todo!',
        },
      },
    });
  });

  it('resets mocks back to state when originally instantiated', async () => {
    mockNetwork.addMocks({
      Query: () => ({
        photo: () => ({
          id: 'abc',
          title: 'I am a manually mocked photo!',
        }),
      }),
    });
    mockNetwork.resetMocks();

    const res1 = await networkRequest(`
      query photo($id: ID!) {
        photo(id: $id) {
          id
          title
        }
      }
    `);

    expect(res1.data).not.toEqual({
      data: {
        photo: {
          id: 'abc',
          title: 'I am a manually mocked photo!',
        },
      },
    });

    const res2 = await networkRequest(`
      query todo($id: ID!) {
        todo(id: $id) {
          id
          title
        }
      }
    `);

    expect(res2.data).toEqual({
      data: {
        todo: {
          id: 'xyz',
          title: 'I am a manually mocked todo!',
        },
      },
    });
  });

  it('can stop and restart mockNetwork server', async () => {
    mockNetwork.stop();

    await expect(
      Promise.race([
        networkRequest(`
          query todo($id: ID!) {
            todo(id: $id) {
              id
              title
            }
          }
        `),
        rejectTimeout(4000),
      ])
    ).rejects.toThrow(Error);

    mockNetwork.start();

    const res2 = await networkRequest(`
      query todo($id: ID!) {
        todo(id: $id) {
          id
          title
        }
      }
    `);

    expect(res2.data).toEqual({
      data: {
        todo: {
          id: 'xyz',
          title: 'I am a manually mocked todo!',
        },
      },
    });
  });
});
