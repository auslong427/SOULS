# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Build-time args for Vite (pass them with --build-arg)
ARG VITE_GOOGLE_CLIENT_ID=""
ARG VITE_GOOGLE_CALENDAR_ID=""

# Copy lockfile first for cached installs
COPY package.json package-lock.json ./
RUN npm ci

# Copy remaining sources
COPY . .

# Generate a .env file consumed by Vite during build (only in build stage)
RUN printf "VITE_GOOGLE_CLIENT_ID=%s\n" "$VITE_GOOGLE_CLIENT_ID" > .env && \
    if [ -n "$VITE_GOOGLE_CALENDAR_ID" ]; then \
        printf "VITE_GOOGLE_CALENDAR_ID=%s\n" "$VITE_GOOGLE_CALENDAR_ID" >> .env; \
    fi

RUN npm run build

# Runtime stage (nginx)
FROM nginx:stable-alpine AS runner
WORKDIR /usr/share/nginx/html

# Copy built static assets
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx template and entrypoint that will substitute the runtime port
COPY nginx.conf.template /etc/nginx/nginx.conf.template
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Cloud Run expects the container to listen on $PORT (default 8080). We expose 8080 as a hint.
EXPOSE 8080

# Start entrypoint which writes nginx.conf and execs nginx
CMD ["/docker-entrypoint.sh"]
