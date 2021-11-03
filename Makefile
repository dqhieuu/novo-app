all: server

server:
	go build -o /novo-server

generate:
	sqlc generate

migrate:
	migrate -path ./static/migrations -database "postgres://root:root@database:5432/novo?sslmode=disable" up