-- name: Likes :exec
INSERT INTO book_group_likes(user_id, book_group_id, point)
VALUES ($1, $2, 1);

-- name: DisLikes :exec
INSERT INTO book_group_likes(user_id, book_group_id, point)
VALUES ($1, $2, -1);

-- name: Unlikes :exec
DELETE FROM book_group_likes WHERE user_id = $1 AND book_group_id = $2;

-- name: GetLikes :one
SELECT coalesce(SUM(point), 0) as totalLikes FROM book_group_likes WHERE book_group_id = $1 AND point > 0;

-- name: GetDislikes :one
SELECT coalesce(SUM(point), 0) as totalLikes FROM book_group_likes WHERE book_group_id = $1 AND point < 0;