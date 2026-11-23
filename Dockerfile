# REIZEVAL — Central Headless API (24/7 Cloud Production Dockerfile)
FROM node:20-alpine

WORKDIR /app

# Copy backend source & dependencies
COPY backend/ ./backend/
COPY lib/ ./lib/

# Environment defaults
ENV NODE_ENV=production
ENV PORT=4000
ENV HOST=0.0.0.0

EXPOSE 4000

# Start zero-dependency standalone Node server
CMD ["node", "backend/standalone-server.mjs"]
