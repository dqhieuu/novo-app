package main

import (
	"context"
	"github.com/dqhieuu/novo-app/db"
	"github.com/dqhieuu/novo-app/server"
	"github.com/jackc/pgx/v4/pgxpool"
	"os"
)

func main() {
	ctx := context.Background()

	// Verifies if env to db location exists
	pgUrl, ok := os.LookupEnv("POSTGRES_URL")
	if !ok {
		panic("Environmental variable \"POSTGRES_URL\" is not set. This program will now exit.")
	}

	// Creates a connection pool, supporting concurrency
	dbPool, err := pgxpool.Connect(ctx, pgUrl)
	if err != nil {
		panic(err)
	}
	defer dbPool.Close()
	// Assigns the database pool to package's var
	db.SetPool(dbPool)

	// Checks current migrated version
	db.ValidateVersion(ctx)

	server.Run()
}
