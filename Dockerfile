# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy the rest of your application files
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Command to start your app
CMD ["node", "server.js"]
