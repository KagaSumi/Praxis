# Stage 1: Dependency Caching & Base Setup
FROM node:20-alpine AS base
# Create app directory
WORKDIR /app
# Set environment variables for Next.js build
ENV NODE_ENV=production

# Stage 2: Builder - Install dependencies and build the app
FROM base AS builder
# Copy package files
COPY package*.json ./
# Install only production dependencies
RUN npm ci
# Copy all source files
COPY . .

# Use the production build script
# This generates the optimized code in the .next folder
RUN npm run build 

# Stage 3: Runner - Minimal image to run the built application
FROM base AS runner
# Set the user for security (Next.js best practice)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy essential files from the builder stage
# Copy the built application and static assets
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
# Copy package files (needed for 'npm start')
COPY package*.json ./

# Set the correct ownership
RUN chown -R nextjs:nodejs ./.next ./node_modules 
USER nextjs

# Expose the port your 'start' script uses (8080)
EXPOSE 8080

# Run the production server using the 'start' script
# Your 'start' script is "next start -p 8080"
CMD ["npm", "start"]
