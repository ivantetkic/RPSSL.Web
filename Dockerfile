# Stage 1: Build the React app
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
COPY package-lock.json ./
RUN npm ci

# Copy the rest of your app's source code
COPY . .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Copy and set up the entrypoint script for runtime injection
COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

# Set the entrypoint to our script (THIS IS THE CORRECT STAGE)
ENTRYPOINT ["/entrypoint.sh"]

# The default command to run after the entrypoint
CMD ["nginx", "-g", "daemon off;"]