FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app files
COPY . .

EXPOSE 3000

# Use serve to host the static files
CMD ["npx", "serve", "-s", ".", "-l", "3000"]