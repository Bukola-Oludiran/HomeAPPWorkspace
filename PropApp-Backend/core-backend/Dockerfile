FROM node:20-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /workspace
COPY contracts ./contracts
COPY proto ./proto
COPY PropApp-Backend/core-backend ./PropApp-Backend/core-backend
WORKDIR /workspace/PropApp-Backend/core-backend

# Install dependencies
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start command using node
CMD ["npm", "start"]
