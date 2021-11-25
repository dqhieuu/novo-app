-- name: BookGroupById :one
SELECT *
FROM book_groups
WHERE id = $1;

-- name: BookGroupsByTitle :many
SELECT *
FROM book_groups
WHERE  LOWER(title) LIKE '%' || $1 || '%'
ORDER BY id
OFFSET $2 ROWS
    FETCH FIRST $3 ROWS ONLY;

-- name: UpdateBookGroup :exec
UPDATE book_groups
SET title = $2,
    description=$3,
    ownerid=$4
WHERE id = $1;

-- name: InsertBookGroup :one
INSERT INTO book_groups(title, description,ownerid)
VALUES (@title, @description,@ownerid)
RETURNING *;

-- name: DeleteBookGroup :exec
DELETE FROM book_groups
WHERE id = @id;
