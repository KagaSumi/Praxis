#
# Dockerfile for the Frontend (e.g., React/Vue app) using a multi-stage build
#

# Stage 1: Build the static assets
FROM node:20-slim AS build-stage

# Set the working directory
WORKDIR /app

# Copy package files from the Frontend directory
COPY Frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY Frontend/ .

# Build the application
# This command assumes your package.json has a 'build' script 
# that outputs static files to a 'dist' or 'build' folder.
RUN npm run devL

# Stage 2: Serve the built assets using a minimal NGINX web server
# Copy the built assets from the previous stage to the NGINX default server location
# Adjust 'dist' or 'build' if your frontend build script outputs to a different directory
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy custom NGINX configuration (optional, but good practice for SPAs)
# If your app is a Single Page Application (SPA), you need an NGINX config 
# to handle client-side routing (e.g., redirecting all unmatched paths to index.html)
# You may need to create a file like 'nginx.conf' in your Frontend folder.
# COPY Frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose the standard HTTP port
EXPOSE 80

# The default CMD of NGINX runs the server
CMD ["nginx", "-g", "daemon off;"]
