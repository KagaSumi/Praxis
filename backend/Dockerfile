#
# Dockerfile for the Backend (e.g., Node.js API)
#
# Stage 1: Build/Install Dependencies
FROM node:20-slim AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
# If these files haven't changed, subsequent layers will be skipped.
COPY package*.json ./

# Install production dependencies
RUN npm install --only=production

# --- Final Stage: Production Image ---
FROM node:20-slim

# Set the working directory
WORKDIR /app

# Copy the node_modules and package files from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

# Copy the rest of the application source code
# Assuming the root of your source is inside the Backend folder
COPY . .

# Expose the port your application listens on (e.g., 3000)
EXPOSE 3000

# Command to run the application
# Use 'npm start' or 'node server.js' depending on your entry point
CMD [ "npm", "start" ]

# Note: Remember to replace the EXPOSE port and CMD command 
# if your backend uses different values.
