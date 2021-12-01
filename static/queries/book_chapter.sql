-- name: BookChapterById :one
SELECT *
FROM book_chapters
WHERE id = $1;

-- name: BookChaptersByBookGroupId :many
SELECT *
FROM book_chapters
WHERE book_group_id = $1
ORDER BY id
OFFSET $2 ROWS FETCH FIRST $3 ROWS ONLY;

-- name: UpdateBookChapter :exec
UPDATE book_chapters
SET chapter_number=$2,
    name=$3,
    text_context=$4,
    type=$5,
    book_group_id=$6,
    owner_id=$7
WHERE id = $1;

-- name: InsertBookChapter :one
INSERT INTO book_chapters(chapter_number,name,text_context,type,book_group_id,owner_id)
VALUES (@chapter_number,@name,@text_context,@type,@book_group_id,@owner_id)
RETURNING *;

-- name: DeleteBookChapterById :exec
DELETE
FROM book_chapters
WHERE id = $1;

-- name: DeleteBookChapterByBookGroupId :exec
DELETE
FROM book_chapters
WHERE book_group_id = $1;

-- name: GetBookGroupChapters :many
SELECT *
FROM book_chapters JOIN book_groups bg on book_chapters.book_group_id = bg.id
WHERE bg.id = $1;

-- name: GetBookChapterOwner :one
SELECT users.id, users.user_name
FROM users JOIN book_chapters bc on users.id = bc.owner_id
WHERE bc.id = $1;

-- name: LastChapterInBookGroup :one
SELECT chapter_number,date_created
FROM book_chapters AS bc
WHERE bc.book_group_id = $1
  AND date_created IN ( SELECT MAX(date_created) as max_date_created
                        FROM book_chapters AS bc
                        WHERE bc.book_group_id = $1 );