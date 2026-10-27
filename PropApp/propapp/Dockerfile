FROM node:20-alpine

WORKDIR /workspace
COPY contracts ./contracts
COPY PropApp/propapp ./PropApp/propapp
WORKDIR /workspace/PropApp/propapp

# Install dependencies
RUN npm install

# Build the application
RUN npm run build

# Expose port
EXPOSE 4173

# Start command
CMD ["npx", "vite", "preview", "--host"]
