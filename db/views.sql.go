// Code generated by sqlc. DO NOT EDIT.
// source: views.sql

package db

import (
	"context"
	"time"
)

const getBookGroupView = `-- name: GetBookGroupView :one
SELECT COALESCE(sum(count), 0) as totalView
FROM book_chapter_views JOIN book_chapters bc on book_chapter_views.book_chapter_id = bc.id
                        JOIN book_groups bg on bc.book_group_id = bg.id
WHERE bg.id = $1
`

func (q *Queries) GetBookGroupView(ctx context.Context, id int32) (interface{}, error) {
	row := q.db.QueryRow(ctx, getBookGroupView, id)
	var totalview interface{}
	err := row.Scan(&totalview)
	return totalview, err
}

const getViewByMonth = `-- name: GetViewByMonth :one
SELECT COALESCE(sum(count), 0) as viewByMonth FROM book_chapter_views
WHERE book_chapter_id = $1
AND view_date >= now() - interval '1 month'
`

func (q *Queries) GetViewByMonth(ctx context.Context, bookChapterID int32) (interface{}, error) {
	row := q.db.QueryRow(ctx, getViewByMonth, bookChapterID)
	var viewbymonth interface{}
	err := row.Scan(&viewbymonth)
	return viewbymonth, err
}

const getViewByWeek = `-- name: GetViewByWeek :one
SELECT COALESCE(sum(count), 0) as viewByWeek FROM book_chapter_views
WHERE book_chapter_id = $1
  AND view_date >= now() - interval '1 week'
`

func (q *Queries) GetViewByWeek(ctx context.Context, bookChapterID int32) (interface{}, error) {
	row := q.db.QueryRow(ctx, getViewByWeek, bookChapterID)
	var viewbyweek interface{}
	err := row.Scan(&viewbyweek)
	return viewbyweek, err
}

const getViewByYear = `-- name: GetViewByYear :one
SELECT COALESCE(sum(count), 0) as viewByYear FROM book_chapter_views
WHERE book_chapter_id = $1
  AND view_date >= now() - interval '1 year'
`

func (q *Queries) GetViewByYear(ctx context.Context, bookChapterID int32) (interface{}, error) {
	row := q.db.QueryRow(ctx, getViewByYear, bookChapterID)
	var viewbyyear interface{}
	err := row.Scan(&viewbyyear)
	return viewbyyear, err
}

const upsertViewByDate = `-- name: UpsertViewByDate :exec
INSERT INTO book_chapter_views(book_chapter_id, view_date)
VALUES ($1, $2)
ON CONFLICT(book_chapter_id, view_date)
DO UPDATE SET count = book_chapter_views.count + 1
`

type UpsertViewByDateParams struct {
	BookChapterID int32     `json:"bookChapterID"`
	ViewDate      time.Time `json:"viewDate"`
}

func (q *Queries) UpsertViewByDate(ctx context.Context, arg UpsertViewByDateParams) error {
	_, err := q.db.Exec(ctx, upsertViewByDate, arg.BookChapterID, arg.ViewDate)
	return err
}
