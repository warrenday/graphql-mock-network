# GraphQL Network Mock

Simple network mocking for your GraphQL API.

## Problem

Mocking network requests usually requires monkey patching or replacing native APIs such as Fetch or XHR. This is problematic as it is not realistic to your production application. With GraphQL Network Mock you can write tests with more confidence by mocking via service workers. Eliminating differences between test and production.

Internally we use [MSW](https://github.com/mswjs/msw) for the heavy lifting in applying these mocks. This means you can even see the mocked requests in the network tab!

## Features

By combining a graphql mock server with MSW you can achieve simple auto-mocking of your entire GraphQL schema at the network level. With the option of applying specific mocks on a per-test basis.

GraphQL Network Mock provides:

* Network level mocking
* Auto mock against a graphql schema
* Manual mocking for individual tests

## Installing

TODO

## Usage Example

TODO

## Documentation

## Licence

The MIT License (MIT)

Copyright (c) 2020 GraphQL Network Inspector authors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
