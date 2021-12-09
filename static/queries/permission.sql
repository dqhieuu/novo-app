-- name: CheckPermissionOnUserId :one
SELECT exists(
               select 1
               FROM users
                        JOIN role_permissions rp on users.role_id = rp.role_id
               WHERE rp.module = $1
                 AND rp.action = $2
                 AND id = $3
           );