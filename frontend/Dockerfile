# Use official Node.js image as base
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Expose frontend port
EXPOSE 3000

# Start the Next.js server
CMD ["npm", "run", "start"]