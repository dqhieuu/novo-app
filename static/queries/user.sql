-- name: UserByUsernameOrEmail :one
SELECT *
FROM users
WHERE user_name = $1
   OR email = $1
    FETCH FIRST ROWS ONLY;

-- name: UserByEmail :one
SELECT *
FROM users
WHERE email = $1
    FETCH FIRST ROWS ONLY;

-- name: InsertUser :one
INSERT INTO users(user_name, password, email, role_id)
VALUES (@user_name, @password, @email, (SELECT id FROM roles WHERE name = @role_name))
RETURNING *;

-- name: DeleteUser :exec
DELETE
FROM users
WHERE user_name = $1;

-- name: CompleteOauthAccount :exec
UPDATE users
SET user_name = $2,
    avatar_image_id = $3,
    role_id = $4
WHERE id = $1;

