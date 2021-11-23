-- name: InsertNewRole :one
INSERT INTO roles (name, description)
VALUES ($1, $2)
RETURNING *;

-- name: DeleteRole :exec
DELETE
FROM roles
WHERE name = $1;

-- name: RoleByUserId :one
SELECT r.name                             role_name,
       array_agg(module || '.' || action) role_permissions
FROM role_permissions rp
         JOIN roles r on r.id = rp.role_id
         JOIN users u on r.id = u.role_id
WHERE u.id = $1
GROUP BY r.name;

