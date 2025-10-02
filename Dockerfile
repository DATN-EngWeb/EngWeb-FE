FROM node:22-alpine

WORKDIR /app

# Copy only lockfiles first to leverage Docker layer cache when present
COPY package.json package-lock.json* ./

# Install deps (will be re-run if package files change)
RUN npm ci || npm install

# Default command is dev server; source will be bind-mounted at runtime
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["npm", "run", "dev"]


