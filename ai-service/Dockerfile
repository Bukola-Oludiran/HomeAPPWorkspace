FROM node:20-alpine
RUN apk add --no-cache openssl
WORKDIR /workspace
COPY proto ./proto
COPY PropApp-Backend/core-backend/prisma/schema.prisma ./PropApp-Backend/core-backend/prisma/schema.prisma
COPY ai-service ./ai-service
WORKDIR /workspace/ai-service
RUN npm ci && npm run prisma:sync && npm run build
EXPOSE 4000
CMD ["npm", "start"]
