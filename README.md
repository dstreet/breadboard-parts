# Breadboard Parts

This is a sample application to fetch packaging and pricing information for
electronic parts.

## Installing

Install the necessary dependencies

```sh
$ npm install
```

Create a `.env` file for the API by copying `packages/api/.env.example` and replacing the
appropriate values.

Create a `.env.local` file for the client by copying `packages/client/.env.local.example`.

## Running

The following command will start both the API and React client in dev mode.
Both will watch for file changes and reload as needed

```sh
$ npm run start:dev
```

To run the API independently, run the following:

```sh
$ npm -w api run start:dev
```

To run the client independently, run the following:

```sh
$ npm -w client run start
```

## Usage

To use the part finder, enter a part number into the client form or pass the part number as a query parameter to the client:
`http://localhost:3000?part=0510210200`

## Testing

```sh
$ npm test
```