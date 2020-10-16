# GraphQL Mock Network

Simple network mocking for your GraphQL API.

## Problem

Mocking network requests usually requires monkey patching or replacing native APIs such as Fetch or XHR. This is problematic as it is not realistic to your production application. With GraphQL Mock Network you can write tests with more confidence by mocking via service workers. Eliminating differences between test and production.

Internally we use [MSW](https://github.com/mswjs/msw) for the heavy lifting in applying these mocks. This means you can even see the mocked requests in the network tab!

## Features

By combining a graphql mock server with MSW you can achieve simple auto-mocking of your entire GraphQL schema at the network level. With the option of applying specific mocks on a per-test basis.

GraphQL Mock Network provides:

- Network level mocking
- Auto-mocking against a graphql schema
- Manual mocking for individual tests

## Installing

`npm i graphql-mock-network`

## Usage Example

```ts
import { MockNetwork } from 'graphql-mock-network';
import schema from './introspection.schema.graphql';

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

mockNetwork.start();

// Now when making a network request. The data will be mocked.

const res = await axios.post(
  '/graphql',
  {
    query: `
      query todo($id: ID!) {
        todo(id: $id) {
          id
          title
        }
      }
    `,
    variables: {
      id: 1,
    },
  },
  {
    headers: { 'Content-Type': 'application/json' },
  }
);

console.log(res.data);

// {
//   data: {
//     todo: {
//       id: 'xyz',
//       title: 'I am a manually mocked todo!',
//     },
//   }
// }
```

## Browser Usage (Important)

If you are running the mock api in browser a service worker is required given Mock Service Worker is used internally. You can read more over at the [MSW browser integrate guide](https://mswjs.io/docs/getting-started/integrate/browser).

TL;DR you can copy the file [./mockServiceWorker.js](./mockServiceWorker.js) to be served from the root directory of your site. i.e. so it can be accessed in browser at `http://{{yourdomain}}/mockServiceWorker.js`.

## Documentation

### MockNetwork

Create a new instance of MockNetwork which takes your graphql schema and some initial mocks.

```ts
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
```

### start

Start the server to ensure all graphql requests are listened for.

```ts
mockNetwork.start();
```

### stop

Stop the server to prevent all mocking. Allows requests to continue on as normal.

```ts
mockNetwork.stop();
```

### addMocks

Add or replace a new or existing mock.

```ts
mockNetwork.addMocks({
  Query: () => ({
    photo: () => ({
      id: 'abc',
      title: 'I am a manually mocked photo!',
    }),
  }),
});
```

### resetMocks

Reset mocks back to the state when the `mockNetwork` was instantiated.

```ts
mockNetwork.resetMocks();
```

## Licence

The MIT License (MIT)

Copyright (c) 2020 GraphQL Network Inspector authors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
