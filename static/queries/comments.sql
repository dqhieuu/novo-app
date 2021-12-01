-- name: AddComment :exec
INSERT INTO book_comments(user_id, book_group_id, book_chapter_id, content) VALUES ($1, $2, $3, $4);

-- name: DeleteComment :exec
DELETE FROM book_comments WHERE id = $1;

-- name: UpdateComment :exec
UPDATE book_comments SET content = $2 WHERE id = $1;

-- name: GetTotalBookGroupComments :one
SELECT count(*) FROM book_comments WHERE book_group_id = $1;

-- name: GetTotalBookChapterComments :one
SELECT count(*) FROM book_comments WHERE book_chapter_id = $1;

-- name: GetTotalBookGroupAndChapterComments :one
SELECT count(*) FROM book_comments WHERE book_group_id = $1 AND book_chapter_id = $2;

-- name: GetBookGroupComments :many
SELECT *
FROM book_comments
WHERE book_group_id = $1
ORDER BY posted_time
LIMIT 20 OFFSET $2;

-- name: GetBookChapterComments :many
SELECT *
FROM book_comments
WHERE book_chapter_id = $1
ORDER BY posted_time
LIMIT 20 OFFSET $2;


-- name: GetBookGroupAndChapterComments :many
SELECT *
FROM book_comments
WHERE book_group_id = $1 AND book_chapter_id = $2
ORDER BY posted_time
LIMIT 20 OFFSET $3;

-- name: GetCommenter :one
SELECT users.id, users.user_name, i.path
FROM users JOIN book_comments bc on users.id = bc.user_id
            LEFT JOIN images i on users.avatar_image_id = i.id
WHERE bc.id = $1;

-- name: GetCommentChapterInfo :one
SELECT book_chapters.id, book_chapters.chapter_number
FROM book_chapters JOIN book_comments bc on book_chapters.id = bc.book_chapter_id
WHERE bc.id = $1;