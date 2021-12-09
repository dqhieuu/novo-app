// Code generated by sqlc. DO NOT EDIT.
// source: permission.sql

package db

import (
	"context"
)

const checkPermissionOnUserId = `-- name: CheckPermissionOnUserId :one
SELECT exists(
               select 1
               FROM users
                        JOIN role_permissions rp on users.role_id = rp.role_id
               WHERE rp.module = $1
                 AND rp.action = $2
                 AND id = $3
           )
`

type CheckPermissionOnUserIdParams struct {
	Module string `json:"module"`
	Action string `json:"action"`
	ID     int32  `json:"id"`
}

func (q *Queries) CheckPermissionOnUserId(ctx context.Context, arg CheckPermissionOnUserIdParams) (bool, error) {
	row := q.db.QueryRow(ctx, checkPermissionOnUserId, arg.Module, arg.Action, arg.ID)
	var exists bool
	err := row.Scan(&exists)
	return exists, err
}
