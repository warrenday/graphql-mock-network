import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { MockNetwork } from './index';

const schema = fs.readFileSync(
  path.resolve(__dirname, '../introspection.schema.graphql'),
  'utf8'
);

const networkRequest = (query: string) => {
  return axios.post(
    '/graphql',
    {
      query,
      variables: {
        id: 1,
      },
    },
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
};

const mockNetwork = new MockNetwork({
  schema,
  mocks: {
    Query: () => ({
      todo: () => ({
        id: 'xyz',
        title: 'I am a manually mocked todo!',
      }),
    }),
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

  it('mocks a request', async () => {
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

  it('can stop and restart', async () => {
    mockNetwork.stop();

    await expect(
      networkRequest(`
        query todo($id: ID!) {
          todo(id: $id) {
            id
            title
          }
        }
      `)
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
