-- name: CheckGenreExistById :one
SELECT EXISTS(
   SELECT 1
   FROM genres
   WHERE id = $1
);

-- name: GetAllGenre :many
SELECT name, id
FROM genres
ORDER BY name ASC;

-- name: GenreById :one
SELECT *
FROM genres
WHERE id = $1;


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