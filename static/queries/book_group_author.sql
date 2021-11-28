-- name: InsertBookGroupAuthor :one
INSERT INTO book_group_authors(book_group_id, book_author_id)
VALUES (@book_group_id, @book_author_id)
RETURNING *;

-- name: DeleteBookGroupAuthor :exec
DELETE
FROM book_group_authors
WHERE book_group_id = $1
  AND book_author_id = $2;

-- name: BookGroupAuthor :one
SELECT EXISTS(
   SELECT 1
   FROM book_group_authors
   WHERE book_group_id = $1
     AND book_author_id = $2
);

-- name: BookGroupsByAuthor :many
SELECT bga.book_group_id
FROM book_group_authors AS bga
WHERE bga.book_author_id = $1
ORDER BY bga.book_group_id
OFFSET $2 ROWS
    FETCH FIRST $3 ROWS ONLY;

-- name: AuthorsByBookGroup :many
SELECT bga.book_author_id
FROM book_group_authors AS bga
WHERE bga.book_group_id = $1
ORDER BY bga.book_author_id
OFFSET $2
    ROWS FETCH FIRST $3 ROWS ONLY;

-- name: DelBookGroupAuthorsByAuthor :exec
DELETE
FROM book_group_authors
WHERE book_author_id = $1;

-- name: DelBookGroupAuthorsByBookGroup :exec
DELETE
FROM book_group_authors
WHERE book_group_id = $1;