FROM node:20-alpine AS build
WORKDIR /app
COPY package.json yarn.lock ./
COPY packages/shared/package.json packages/shared/package.json
COPY services/user-publication-service/package.json services/user-publication-service/package.json
RUN corepack enable && yarn install --frozen-lockfile
COPY packages/shared/tsconfig.json packages/shared/tsconfig.build.json ./packages/shared/
COPY packages/shared/src ./packages/shared/src
COPY services/user-publication-service/tsconfig.json services/user-publication-service/tsconfig.build.json ./services/user-publication-service/
COPY services/user-publication-service/src ./services/user-publication-service/src
RUN yarn workspace @mgm/shared build
RUN yarn workspace user-publication-service build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json yarn.lock ./
COPY packages/shared/package.json packages/shared/package.json
COPY services/user-publication-service/package.json services/user-publication-service/package.json
RUN corepack enable && yarn install --production --frozen-lockfile
COPY --from=build /app/packages/shared/dist ./packages/shared/dist
COPY --from=build /app/services/user-publication-service/dist ./services/user-publication-service/dist
WORKDIR /app/services/user-publication-service
CMD ["node", "dist/main.js"]
