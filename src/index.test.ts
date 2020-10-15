import path from 'path';
import axios from 'axios';
import { MockNetwork } from './index';

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

const createNewMockNetwork = () => {
  const mockNetwork = new MockNetwork({
    schemaPath,
    mocks: {
      Query: () => ({
        todo: () => ({
          id: 'xyz',
          title: 'I am a manually mocked todo!',
        }),
      }),
    },
  });
  mockNetwork.listen();

  return mockNetwork;
};

const schemaPath = path.resolve(__dirname, '../introspection.schema.graphql');

describe('MockNetwork', () => {
  let mockNetwork: MockNetwork;
  beforeEach(() => {
    mockNetwork = createNewMockNetwork();
  });

  afterEach(() => {
    if (mockNetwork) {
      mockNetwork.close();
    }
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
});
