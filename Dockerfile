FROM node:22-alpine

WORKDIR /app

EXPOSE 3000

COPY . .

RUN npm install
RUN npm run build

# ENTRYPOINT [ "/usr/local/bin/npm run serve" ]

CMD [ "npm", "run", "serve" ]