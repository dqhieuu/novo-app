-- name: CheckAuthorExist :one
SELECT EXISTS(
   SELECT 1
   FROM book_authors
   WHERE name = $1
);

-- name: BookAuthorById :one
SELECT *
FROM book_authors
WHERE id = $1;

-- name: BookAuthors :many
SELECT *
FROM book_authors
ORDER BY id ASC
OFFSET $1 ROWS
    FETCH FIRST $2 ROWS ONLY;

-- name: InsertBookAuthor :one
INSERT INTO book_authors(name, description, avatar_image_id)
VALUES (@name, @description, @avatar_image_id)
RETURNING *;

-- name: DeleteBookAuthor :exec
DELETE
FROM book_authors
WHERE id = @id;

-- name: UpdateBookAuthor :exec
UPDATE book_authors
SET name        = $2,
    description = $3,
    avatar_image_id    = $4
WHERE id = $1;