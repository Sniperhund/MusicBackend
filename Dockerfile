FROM node:21-alpine3.18

WORKDIR /app

COPY package.json /app
COPY tsconfig.json /app
COPY src /app/src
COPY scripts /app/scripts

RUN apk update
RUN apk upgrade
RUN apk add --no-cache ffmpeg
RUN apk add --no-cache python3
RUN npm install
RUN npm run build

CMD ["npm", "run", "start"]