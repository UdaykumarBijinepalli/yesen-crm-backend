FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --no-frozen-lockfile
COPY . .

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app /app
ENV NODE_ENV=production
EXPOSE 5001
CMD ["node", "src/server.js"]
