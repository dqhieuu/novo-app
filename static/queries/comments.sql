-- name: AddComment :exec
INSERT INTO book_comments(user_id, book_group_id, book_chapter_id, content) VALUES ($1, $2, $3, $4);

-- name: DeleteComment :exec
DELETE FROM book_comments WHERE user_id = $1 AND book_group_id = $2 AND book_chapter_id = $3;

-- name: UpdateComment :exec
UPDATE book_comments SET content = $4 WHERE user_id = $1 AND book_group_id = $2 AND book_chapter_id = $3;