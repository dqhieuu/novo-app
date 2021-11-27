package server

import (
	"context"
	"errors"
	"fmt"
	"github.com/dqhieuu/novo-app/db"
)

func UserRole(userId int32) (*db.RoleRow, error) {
	ctx := context.Background()
	queries := db.New(db.Pool())

	role, err := queries.Role(ctx, userId)
	if err != nil {
		return nil, errors.New(fmt.Sprintf("getting user role failed: %s", err))
	}

	return &role, nil
}
