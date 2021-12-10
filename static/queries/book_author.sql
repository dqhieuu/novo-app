-- name: CheckAuthorExistByName :one
SELECT EXISTS(
               SELECT 1
               FROM book_authors
               WHERE name = $1
           );

-- name: CheckAuthorExistById :one
SELECT EXISTS(
               SELECT 1
               FROM book_authors
               WHERE id = $1
           );

-- name: BookAuthorById :one
SELECT *
FROM book_authors
WHERE id = $1;

-- name: BookAuthors :many
SELECT *
FROM book_authors
ORDER BY id ASC
OFFSET $1 ROWS FETCH FIRST $2 ROWS ONLY;

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
SET name            = $2,
    description     = $3,
    avatar_image_id = $4
WHERE id = $1;

-- name: GetBookGroupAuthors :many
SELECT book_authors.id, book_authors.name
FROM book_authors
         JOIN book_group_authors bga on book_authors.id = bga.book_author_id
         JOIN book_groups bg on bga.book_group_id = bg.id
WHERE bg.id = $1;

-- name: SearchAuthors :many
SELECT book_authors.name, book_authors.id, i.path
FROM book_authors
         LEFT JOIN images i on book_authors.avatar_image_id = i.id
WHERE name ILIKE '%' || $1 || '%'
LIMIT 5;