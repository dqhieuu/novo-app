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
    description=$3,
    text_context=$4,
    type=$5,
    book_group_id=$6,
    owner_id=$7
WHERE id = $1;

-- name: InsertBookChapter :one
INSERT INTO book_chapters(chapter_number,description,text_context,type,book_group_id,owner_id)
VALUES (@chapter_number,@description,@text_context,@type,@book_group_id,@owner_id)
RETURNING *;

-- name: DeleteBookChapterById :exec
DELETE
FROM book_chapters
WHERE id = $1;

-- name: DeleteBookChapterByBookGroupId :exec
DELETE
FROM book_chapters
WHERE book_group_id = $1;