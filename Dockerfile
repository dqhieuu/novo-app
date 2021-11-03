# syntax=docker/dockerfile:1

FROM golang:1.17.2-alpine3.14

WORKDIR /app

# Cache dependencies files
COPY go.mod .
COPY go.sum .
RUN go mod download

# Copy server
COPY . .

# RUN go install github.com/kyleconroy/sqlc/cmd/sqlc@latest
# RUN sqlc generate

RUN go build -o /novo-server

EXPOSE 8080

CMD [ "/novo-server" ]