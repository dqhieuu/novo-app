-- name: InsertNewRole :one
INSERT INTO roles (name, description)
VALUES ($1, $2)
RETURNING *;

-- name: RoleIdByName :one
SELECT id FROM roles
WHERE name = $1
FETCH FIRST ROWS ONLY;

-- name: DeleteRole :exec
DELETE FROM roles
WHERE name = $1;
