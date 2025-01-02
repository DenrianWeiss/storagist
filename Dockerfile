FROM node:22-bookworm

COPY . /app
WORKDIR /app

# Install dependencies
RUN npm install
ENTRYPOINT ["npx", "tsx", "index.ts"]