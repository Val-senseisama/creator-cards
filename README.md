# Creator Card Microservice

A REST API for managing creator cards. Built with Node.js, Express, and MongoDB.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/creator-cards` | Create a new creator card |
| `GET` | `/creator-cards/:slug` | Retrieve a published creator card by slug |
| `DELETE` | `/creator-cards/:slug` | Soft-delete a creator card |

## Setup

1. Copy `.env.example` to `.env` and fill in the required values:
   ```
   PORT=3000
   MONGODB_URI=mongodb://...
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   node app.js
   ```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Port the server listens on |
| `MONGODB_URI` | MongoDB connection string |
