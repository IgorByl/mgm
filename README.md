# Event-Driven Microservices

This repository contains a three-service Node.js system using MongoDB transactions, the Outbox pattern, and Kafka:

- **User Service**: CRUD for users, writes to `users` and `outbox` in the same MongoDB transaction.
- **User Publication Service**: polls `outbox`, transforms mongo events to business system events, and publishes to Kafka (`users.events`).
- **Notification Service**: Kafka consumer group that logs only `UserCreated` and `UserDeleted` events.
- **Shared Package**: `@mgm/shared` contains common event types, reusable modules and outbox schema.

```
                         MongoDB (rs0)
                    ┌─────────┬──────────┐
                    │  users  │  outbox   │
                    └────▲────┴────┬──▲───┘
                         │         │  │
                    write (tx)   read │ mark processed
                         │         │  │
┌──────────────┐         │    ┌────▼──┴───────────────┐
│              │         │    │                       │
│ REST Client  ├────►  User   │  User Publication     │
│              │      Service │  Service              │
└──────────────┘   :3000      └──────────┬────────────┘
                                         │ publish
                                         ▼
                                ┌─────────────────┐
                                │      Kafka      │
                                │  users.events   │
                                └────────┬────────┘
                                         │ consume
                                         ▼
                                ┌─────────────────┐
                                │  Notification   │
                                │  Service  :3001 │
                                └─────────────────┘
```

## Run It

```bash
yarn install                # install all dependencies
yarn build                  # build shared package + all services
yarn docker:up:detached     # start infrastructure + services in background
yarn logs:flow:macbook      # tail all service logs (macOS only)
```

Stop all the instances

```bash
yarn docker:down            # stop all and remove volumes
```

If you are not on macOS, use individual log commands instead:

```bash
yarn logs:user              # user-service logs
yarn logs:publication       # user-publication-service logs
yarn logs:notification      # notification-service logs
```

## Services & Defaults

- User Service: `http://localhost:3000`
- User Publication Service: `http://localhost:3002`
- Notification Service: `http://localhost:3001`
- MongoDB: `localhost:27017` (replica set for transactions)
- Kafka (host): `localhost:9092`
- Kafka (docker network): `kafka:29092`
- Zookeeper: `localhost:2181`

## Prerequisites

- Docker + Docker Compose
- Node.js 20 LTS
- Yarn (v1.x)

## Quick Start (Docker Compose)

From the repo root:

```bash
yarn setup                  # install + build (one command)
yarn docker:up              # start all in foreground
```

Or run detached:

```bash
yarn docker:up:detached     # start all in background
```

Notes:

- A `mongo-init` container initializes the replica set for transactions.
- Kafka starts with auto-topic creation enabled for `users.events`.

To stop and remove containers/volumes:

```bash
yarn docker:down
```

## Local Development (per service)

Requires infrastructure (MongoDB, Kafka) already running via Docker.

From the repo root:

```bash
yarn start:user             # User Service
yarn start:publication      # User Publication Service
yarn start:notification     # Notification Service
```

## Environment Variables (expected)

Docker Compose reads variables from `.env`. Each service has a single config file (`src/config.ts`) that maps env vars to typed fields.

### User Service

- `MONGO_URI` (example: `mongodb://localhost:27017/users?replicaSet=rs0`)
- `LOG_LEVEL` (example: `info`)

### User Publication Service

- `MONGO_URI` (example: `mongodb://localhost:27017/users?replicaSet=rs0`)
- `KAFKA_BROKERS` (example: `kafka:29092` or `localhost:9092`)
- `KAFKA_TOPIC` (default: `users.events`)
- `PUBLISH_BATCH_SIZE` (default: `100`)
- `POLL_INTERVAL_MS` (default: `1000`)
- `LOG_LEVEL` (example: `info`)

### Notification Service

- `KAFKA_BROKERS` (example: `kafka:29092` or `localhost:9092`)
- `KAFKA_TOPIC` (default: `users.events`)
- `KAFKA_GROUP_ID` (default: `notification-group`)
- `LOG_LEVEL` (example: `info`)

## Scripts (per service)

These scripts are available in each service `package.json`:

- `build`: Compile TypeScript to `dist/`.
- `start`: Start the compiled app.
- `lint`: Run linting.

## Health Checks

- User Service: `GET http://localhost:3000/health`
- User Publication Service: `GET http://localhost:3002/health`
- Notification Service: `GET http://localhost:3001/health`

## Smoke Test

1. Create a user:

```bash
curl -X POST http://localhost:3000/user \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ada Lovelace","email":"ada@example.com"}'
```

2. Delete the user (replace `<id>` with the created user ID):

```bash
curl -X DELETE http://localhost:3000/user/<id>
```

3. Watch logs:

```bash
yarn logs:publication       # user-publication-service logs
yarn logs:notification      # notification-service logs
```

## Troubleshooting

- **Ports in use**: Ensure `27017`, `9092`, `2181`, `3000`, `3001`, and `3002` are free.
- **Mongo transactions fail**: Ensure replica set is initialized (`mongo-init` should run once).
- **Kafka not reachable**: Wait for Kafka to finish booting; check logs if services start too quickly.
- **Rebuild after changes**: `docker compose up --build`.

## Examples

![list users request with pagination](https://github.com/user-attachments/assets/e86234be-c381-4c66-a541-548ffea31c4d)

![health-check endpoint](https://github.com/user-attachments/assets/fc6682d9-f88d-436f-8a03-019e114390a5)

![run example](https://github.com/user-attachments/assets/f9bdb9ef-2bd4-402c-8540-b87557c806de)

