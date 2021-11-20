-- name: UpsertViewByDate :exec
INSERT INTO book_chapter_views(book_chapter_id, view_date)
VALUES ($1, $2)
ON CONFLICT(book_chapter_id, view_date)
DO UPDATE SET count = count + 1;

-- name: GetViewByWeek :one
SELECT SUM(count) as viewByWeek FROM book_chapter_views
WHERE book_chapter_id = $1
  AND view_date >= date_trunc('week', now() - interval '1 week')
  AND view_date < date_trunc('week', now());

-- name: GetViewByMonth :one
SELECT SUM(count) as viewByMonth FROM book_chapter_views
WHERE book_chapter_id = $1
AND view_date >= date_trunc('month', now() - interval '1 month')
AND view_date < date_trunc('month', now());

-- name: GetViewByYear :one
SELECT SUM(count) as viewByYear FROM book_chapter_views
WHERE book_chapter_id = $1
  AND view_date >= date_trunc('year', now() - interval '1 year')
  AND view_date < date_trunc('year', now());