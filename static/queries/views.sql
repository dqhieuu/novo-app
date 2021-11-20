-- name: UpsertViewByDate :exec
INSERT INTO book_chapter_views(book_chapter_id, view_date)
VALUES ($1, $2)
ON CONFLICT(book_chapter_id, view_date)
DO UPDATE SET count = count + 1;

-- name: GetViewByWeek :one
SELECT SUM(count) as viewByWeek FROM book_chapter_views
WHERE book_chapter_id = $1
AND TRUNC(DATE_PART('day', now()::timestamp - view_date::timestamp)/7) <= 1;

-- name: GetViewByMonth :one
SELECT SUM(count) as viewByMonth FROM book_chapter_views
WHERE book_chapter_id = $1
AND (DATE_PART('year', now()::date) - DATE_PART('year', view_date::date)) * 12 +
    (DATE_PART('month', now()::date) - DATE_PART('month', view_date::date)) <= 1;

-- name: GetViewByYear :one
SELECT SUM(count) as viewByYear FROM book_chapter_views
WHERE book_chapter_id = $1
AND DATE_PART('year', now()::date) - DATE_PART('year', view_date::date) <= 1;