package db

import (
	"context"
	"fmt"
	"github.com/jackc/pgx/v4/pgxpool"
)

var pool *pgxpool.Pool

func SetPool(p *pgxpool.Pool) {
	pool = p
}

func Pool() *pgxpool.Pool {
	return pool
}

// ValidateVersion validates current database version
func ValidateVersion(ctx context.Context) {
	rows, err := pool.Query(ctx, "SELECT * FROM schema_migrations")

	if err != nil || !rows.Next() {
		panic("Can't read database version.")
	}

	var version uint64
	var isDirty bool
	err = rows.Scan(&version, &isDirty)
	defer rows.Close()

	if err != nil {
		panic(err)
	}

	if isDirty {
		panic("Dirty database. Not good. Consider fixing it?")
	}

	if version != DbVersion {
		panic(fmt.Sprintf("Incorrect database version (Current: %d != Supported: %d)", version, DbVersion))
	}
}
