-- name: AddComment :exec
INSERT INTO book_comments(user_id, book_group_id, book_chapter_id, content) VALUES ($1, $2, $3, $4);

-- name: DeleteComment :exec
DELETE FROM book_comments WHERE id = $1;

-- name: UpdateComment :exec
UPDATE book_comments SET content = $2 WHERE id = $1;