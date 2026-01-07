FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application
COPY backend/ .

# Expose the port the app runs on
EXPOSE 10000

# Start the application
CMD ["npm", "start"]
