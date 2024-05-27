FROM node:21-alpine3.18

WORKDIR /app

COPY package.json /app
COPY tsconfig.json /app
COPY src /app/src

RUN apk update
RUN apk upgrade
RUN apk add --no-cache ffmpeg
RUN npm install
RUN npm run build

CMD ["npm", "run", "start"]