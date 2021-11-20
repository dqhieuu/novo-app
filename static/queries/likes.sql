-- name: UpsertLikes :exec
INSERT INTO book_group_likes(user_id, book_group_id, point)
VALUES ($1, $2, 0)
ON CONFLICT (user_id, book_group_id)
DO UPDATE SET point = point + 1;

-- name: DownsertLikes :exec
INSERT INTO book_group_likes(user_id, book_group_id, point)
VALUES ($1, $2, 0)
ON CONFLICT (user_id, book_group_id)
DO UPDATE SET point = point - 1;

-- name: GetLikes :one
SELECT point FROM book_group_likes WHERE user_id = $1 AND book_group_id = $2;