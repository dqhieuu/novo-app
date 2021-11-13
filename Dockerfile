# syntax=docker/dockerfile:1

FROM golang:1.17.2-alpine3.14

WORKDIR /app

# Copy server
COPY . .

RUN go mod download

RUN go build -o /novo-server

EXPOSE 8080

CMD [ "/novo-server" ]