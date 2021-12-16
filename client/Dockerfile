# syntax=docker/dockerfile:1

FROM node:alpine
ENV NODE_ENV=production
ENV TZ="Asia/Ho_Chi_Minh"
RUN apk add tzdata

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production

COPY . .

CMD [ "npm", "start" ]