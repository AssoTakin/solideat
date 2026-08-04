FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --include=dev

# Copy source
COPY . .

# Generate Prisma client and build
RUN npx prisma generate
RUN npm run build

# Start
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
