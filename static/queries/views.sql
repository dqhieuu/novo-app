-- name: UpsertViewByDate :exec
INSERT INTO book_chapter_views(book_chapter_id)
VALUES ($1)
ON CONFLICT(book_chapter_id, view_date)
DO UPDATE SET count = book_chapter_views.count + 1;

-- name: GetViewByWeek :one
SELECT COALESCE(sum(count), 0) as viewByWeek FROM book_chapter_views
WHERE book_chapter_id = $1
  AND view_date >= now() - interval '1 week';

-- name: GetViewByMonth :one
SELECT COALESCE(sum(count), 0) as viewByMonth FROM book_chapter_views
WHERE book_chapter_id = $1
AND view_date >= now() - interval '1 month';

-- name: GetViewByYear :one
SELECT COALESCE(sum(count), 0) as viewByYear FROM book_chapter_views
WHERE book_chapter_id = $1
  AND view_date >= now() - interval '1 year';

-- name: GetBookGroupView :one
SELECT COALESCE(sum(count), 0) as totalView
FROM book_chapter_views JOIN book_chapters bc on book_chapter_views.book_chapter_id = bc.id
                        JOIN book_groups bg on bc.book_group_id = bg.id
WHERE bg.id = $1;