-- name: InsertNewRole :one
INSERT INTO roles (name, description)
VALUES ($1, $2)
RETURNING *;

-- name: DeleteRole :exec
DELETE
FROM roles
WHERE name = $1;

-- name: Role :one
SELECT r.name                             role_name,
       array_agg((module || '.' || action))::text[] role_permissions
FROM role_permissions rp
     JOIN roles r on r.id = rp.role_id
WHERE rp.role_id = $1
GROUP BY r.name;