-- name: InsertBookGroupArt :one
INSERT INTO book_group_arts(book_group_id, image_id)
VALUES (@book_group_id, @image_id)
RETURNING *;

-- name: DeleteCoverOfBookGroup :exec
DELETE
FROM book_group_arts
WHERE book_group_id = $1;

-- name: GetCoverIdsOfBookGroup :many
SELECT image_id
FROM book_group_arts
WHERE book_group_id = $1;