# syntax=docker/dockerfile:1

FROM golang:1.17.2-alpine3.14

WORKDIR /app

COPY go.mod .
COPY go.sum .

RUN go mod download

# Copy server
COPY . .

RUN go build -o /novo-server

EXPOSE 8080

CMD [ "/novo-server" ]