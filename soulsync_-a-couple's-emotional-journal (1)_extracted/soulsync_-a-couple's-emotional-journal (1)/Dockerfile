FROM node:20 AS build
WORKDIR /app

# Provide build-time env values for Vite
ARG VITE_GOOGLE_CLIENT_ID=""
ARG VITE_GOOGLE_CALENDAR_ID=""
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}
ENV VITE_GOOGLE_CALENDAR_ID=${VITE_GOOGLE_CALENDAR_ID}

COPY package.json ./
RUN npm install

COPY . .

# Generate a .env file consumed during the Vite build
RUN printf "VITE_GOOGLE_CLIENT_ID=%s\n" "$VITE_GOOGLE_CLIENT_ID" > .env && \
	if [ -n "$VITE_GOOGLE_CALENDAR_ID" ]; then \
		printf "VITE_GOOGLE_CALENDAR_ID=%s\n" "$VITE_GOOGLE_CALENDAR_ID" >> .env; \
	fi

RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]