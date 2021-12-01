-- name: AllBookGroupGenre :many
SELECT *
FROM book_group_genres
ORDER BY book_group_id,genre_id;

-- name: InsertBookGroupGenre :one
INSERT INTO book_group_genres(book_group_id, genre_id)
VALUES (@book_group_id, @genre_id)
RETURNING *;

-- name: DeleteBookGroupGenre :exec
DELETE
FROM book_group_genres
WHERE book_group_id = $1
  AND genre_id = $2;

-- name: BookGroupGenre :one
SELECT EXISTS(
   SELECT 1
   FROM book_group_genres
   WHERE book_group_id = $1
     AND genre_id = $2
);

-- name: BookGroupsByGenre :many
SELECT bgg.book_group_id
FROM book_group_genres AS bgg
WHERE bgg.genre_id = $1
ORDER BY bgg.book_group_id
OFFSET $2 ROWS FETCH FIRST $3 ROWS ONLY;

-- name: GenresByBookGroup :many
SELECT bgg.genre_id
FROM book_group_genres AS bgg
WHERE bgg.book_group_id = $1
ORDER BY bgg.genre_id
OFFSET $2 ROWS FETCH FIRST $3 ROWS ONLY;

-- name: DelBookGroupGenresByGenre :exec
DELETE
FROM book_group_genres
WHERE genre_id = $1;

-- name: DelBookGroupGenresByBookGroup :exec
DELETE
FROM book_group_genres
WHERE book_group_id = $1;

-- name: GetBookGroupGenres :many
SELECT genres.id, genres.name
FROM genres JOIN book_group_genres bgg on genres.id = bgg.genre_id
            JOIN book_groups bg on bgg.book_group_id = bg.id
WHERE bg.id = $1;

-- name: NumberRowBookGroupInGenre :one
SELECT count(*)
FROM book_group_genres
WHERE genre_id = $1;