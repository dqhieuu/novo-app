-- name: ALLGenre :many
SELECT *
FROM genres
ORDER BY id;

-- name: GenreById :one
SELECT *
FROM genres
WHERE id = $1;

-- name: Genres :many
SELECT *
FROM genres
ORDER BY id ASC
OFFSET $1 ROWS FETCH FIRST $2 ROWS ONLY;

-- name: InsertGenre :one
INSERT INTO genres(name, description, image_id)
VALUES (@name, @description, @image_id)
RETURNING *;

-- name: DeleteGenre :exec
DELETE
FROM genres
WHERE id = @id;

-- name: UpdateGenre :exec
UPDATE genres
SET name        = $2,
    description = $3,
    image_id    = $4
WHERE id = $1;