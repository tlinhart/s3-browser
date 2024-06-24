# syntax=docker/dockerfile:1.4.0
FROM node:22-alpine
WORKDIR /app
EXPOSE 3000
COPY --link . .
RUN npm install
RUN npm run build
CMD ["npm", "run", "serve"]