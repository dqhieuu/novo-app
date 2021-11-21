-- name: UpsertViewByDate :exec
INSERT INTO book_chapter_views(book_chapter_id, view_date)
VALUES ($1, $2)
ON CONFLICT(book_chapter_id, view_date)
DO UPDATE SET count = count + 1;

-- name: GetViewByWeek :one
SELECT SUM(count) as viewByWeek FROM book_chapter_views
WHERE book_chapter_id = $1
  AND view_date >= now() - interval '1 week';

-- name: GetViewByMonth :one
SELECT SUM(count) as viewByMonth FROM book_chapter_views
WHERE book_chapter_id = $1
AND view_date >= now() - interval '1 month';

-- name: GetViewByYear :one
SELECT SUM(count) as viewByYear FROM book_chapter_views
WHERE book_chapter_id = $1
  AND view_date >= now() - interval '1 year';