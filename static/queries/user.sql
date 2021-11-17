-- name: UserByUsernameOrEmail :one
SELECT * FROM users
WHERE user_name = $1
    OR email = $1
FETCH FIRST ROWS ONLY;

-- name: UserByEmail :one
SELECT * FROM users
WHERE email = $1
    FETCH FIRST ROWS ONLY;

-- name: InsertUser :exec
INSERT INTO users(user_name, password, email, role_id)
VALUES (@username, @password, @email, (SELECT id FROM roles WHERE name = @role_name));

-- name: DeleteUser :exec
DELETE FROM users
WHERE user_name = $1;

