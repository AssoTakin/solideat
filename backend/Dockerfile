FROM node:20-slim

# Install OpenSSL and other deps needed by Prisma
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies (dev deps needed for build)
COPY package*.json ./
RUN npm install --include=dev

# Copy source
COPY . .

# Generate Prisma client and build
RUN npx prisma generate
RUN npm run build

# Start
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
