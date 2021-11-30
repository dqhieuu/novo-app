-- name: InsertBookGroupArt :one
INSERT INTO book_group_arts(book_group_id, image_id)
VALUES (@book_group_id, @image_id)
RETURNING *;

-- name: DeleteBookGroupArt :exec
DELETE
FROM book_group_arts
WHERE book_group_id = $1
  AND image_id = $2;
