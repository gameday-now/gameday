FROM oven/bun:latest

RUN apt update
RUN apt install -y curl

WORKDIR /app
ADD package.json bun.lock ./
ADD bun.lock ./
ADD turbo.json ./
ADD packages/models/package.json ./packages/models/
ADD packages/router/package.json ./packages/router/
ADD apps/api/package.json ./apps/api/
ADD apps/client/package.json ./apps/client/
RUN bun install --frozen-lockfile
ADD . .
RUN bun run build

WORKDIR /app/apps/api
EXPOSE 3000
ENTRYPOINT [ "./entrypoint.sh" ]