-- name: BookGroupById :one
SELECT *
FROM book_groups
WHERE id = $1;

-- name: BookGroupsByTitle :many
SELECT *
FROM book_groups
WHERE  LOWER(title) LIKE '%' || $1 || '%'
OFFSET $2 ROWS
    FETCH FIRST $3 ROWS ONLY;

-- name: BookGroupsByGenre :many
SELECT bg.*
FROM book_groups AS bg
         JOIN book_group_genres AS bgg
              ON bg.book_group_id=bgg.book_group_id
WHERE bgg.genre_id=$1
OFFSET $2 ROWS
    FETCH FIRST $3 ROWS ONLY;

-- name: BookGroupsByAuthor :many
SELECT bg.*
FROM book_groups AS bg
         JOIN book_group_authors AS bga
              ON bg.book_group_id=bga.book_group_id
WHERE bga.book_author_id=$1
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
