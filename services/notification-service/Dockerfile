FROM node:20-alpine AS build
WORKDIR /app
COPY package.json yarn.lock ./
COPY packages/shared/package.json packages/shared/package.json
COPY services/notification-service/package.json services/notification-service/package.json
RUN corepack enable && yarn install --frozen-lockfile
COPY packages/shared/tsconfig.json packages/shared/tsconfig.build.json ./packages/shared/
COPY packages/shared/src ./packages/shared/src
COPY services/notification-service/tsconfig.json services/notification-service/tsconfig.build.json ./services/notification-service/
COPY services/notification-service/src ./services/notification-service/src
RUN yarn workspace @mgm/shared build
RUN yarn workspace notification-service build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json yarn.lock ./
COPY packages/shared/package.json packages/shared/package.json
COPY services/notification-service/package.json services/notification-service/package.json
RUN corepack enable && yarn install --production --frozen-lockfile
COPY --from=build /app/packages/shared/dist ./packages/shared/dist
COPY --from=build /app/services/notification-service/dist ./services/notification-service/dist
WORKDIR /app/services/notification-service
CMD ["node", "dist/main.js"]
