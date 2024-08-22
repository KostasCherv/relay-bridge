# Bridge Backend
This backend server is built using Node.js and TypeScript to handle bridging requests between the Arbitrum Sepolia and Optimism Sepolia blockchains. The server stores bridge records and tracks the status of transactions on both the origin and target chains. MongoDB is used as the database for storing these records.
## Setup

1. Check the `.env.example` file to set up the environment variables.

## Development

- Run the application using `npm run dev` for development purposes.

## Production

- Run the application in production using `npm run start`.