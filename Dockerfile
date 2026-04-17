FROM node:20
ENV TZ=UTC

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "src/server.js"]

COPY --chown=app:app . /app
