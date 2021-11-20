package db

import (
	"context"
	"fmt"
	"github.com/jackc/pgx/v4/pgxpool"
	"os"
)

var pool *pgxpool.Pool

func Pool() *pgxpool.Pool {
	return pool
}

// ValidateVersion validates current database version
func validateVersion(ctx context.Context) {
	rows, err := pool.Query(ctx, "SELECT * FROM schema_migrations")

	if err != nil || !rows.Next() {
		panic("Can't read database version.")
	}

	var dbVersion uint64
	var isDirty bool
	err = rows.Scan(&dbVersion, &isDirty)
	defer rows.Close()

	if err != nil {
		panic(err)
	}

	if isDirty {
		panic("Dirty database. Not good. Consider fixing it?")
	}

	if dbVersion != DbVersion {
		panic(fmt.Sprintf("Incorrect database version (Current: %d != Supported: %d)", dbVersion, DbVersion))
	}
}

func Init() {
	if pool != nil {
		return
	}

	ctx := context.Background()
	// Verifies if env to db location exists
	pgUrl, ok := os.LookupEnv("POSTGRES_URL")
	if !ok {
		panic(`Environmental variable "POSTGRES_URL" is not set. This program will now exit.`)
	}

	// Creates a connection pool, supporting concurrency
	dbPool, err := pgxpool.Connect(ctx, pgUrl)
	if err != nil {
		panic(err)
	}
	// Assigns the database pool to package's var
	pool = dbPool
	// Checks current migrated version
	validateVersion(ctx)
}
