// Code generated by sqlc. DO NOT EDIT.
// source: book_group_author.sql

package db

import (
	"context"
	"database/sql"
)

const authorsByBookGroup = `-- name: AuthorsByBookGroup :many
SELECT bga.book_author_id
FROM book_group_authors AS bga
WHERE bga.book_group_id = $1
ORDER BY bga.book_author_id
OFFSET $2
    ROWS FETCH FIRST $3 ROWS ONLY
`

type AuthorsByBookGroupParams struct {
	BookGroupID int32 `json:"bookGroupID"`
	Offset      int32 `json:"offset"`
	Limit       int32 `json:"limit"`
}

func (q *Queries) AuthorsByBookGroup(ctx context.Context, arg AuthorsByBookGroupParams) ([]int32, error) {
	rows, err := q.db.Query(ctx, authorsByBookGroup, arg.BookGroupID, arg.Offset, arg.Limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []int32
	for rows.Next() {
		var book_author_id int32
		if err := rows.Scan(&book_author_id); err != nil {
			return nil, err
		}
		items = append(items, book_author_id)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const bookGroupAuthor = `-- name: BookGroupAuthor :one
SELECT EXISTS(
   SELECT 1
   FROM book_group_authors
   WHERE book_group_id = $1
     AND book_author_id = $2
)
`

type BookGroupAuthorParams struct {
	BookGroupID  int32 `json:"bookGroupID"`
	BookAuthorID int32 `json:"bookAuthorID"`
}

func (q *Queries) BookGroupAuthor(ctx context.Context, arg BookGroupAuthorParams) (bool, error) {
	row := q.db.QueryRow(ctx, bookGroupAuthor, arg.BookGroupID, arg.BookAuthorID)
	var exists bool
	err := row.Scan(&exists)
	return exists, err
}

const bookGroupsByAuthor = `-- name: BookGroupsByAuthor :many
SELECT bga.book_group_id id,
       (array_agg(i.path))[1] AS image,
       (array_agg(bg.title))[1] title,
       bct.latestChapter,
       bct.lastUpdated,
       bct.views,
       bcm.comments,
       bgl.likes
FROM book_group_authors AS bga
         LEFT JOIN book_groups AS bg ON bga.book_group_id = bg.id
         LEFT JOIN Lateral (
    SELECT count(bcm.id) AS comments
    FROM book_comments bcm
    WHERE bcm.book_group_id = bga.book_group_id
    ) bcm ON TRUE
         LEFT JOIN Lateral (
    SELECT coalesce(sum(bgl.point), 0) AS likes
    FROM book_group_likes bgl
    WHERE bgl.book_group_id = bga.book_group_id
    ) bgl ON TRUE
         LEFT JOIN LATERAL (
    SELECT (array_agg(bct.chapter_number ORDER BY bct.date_created DESC))[1] AS latestChapter,
           MAX(bct.date_created) AS lastUpdated,
           coalesce(sum(bcv.count),0) AS views
    FROM book_chapters bct
             LEFT JOIN book_chapter_views bcv
                       ON bct.id = bcv.book_chapter_id
    WHERE bct.book_group_id = bga.book_group_id
    ) bct ON TRUE
         LEFT JOIN images i ON bg.primary_cover_art_id = i.id
WHERE bga.book_author_id = $1
GROUP BY bga.book_group_id, bg.title, i.path, bct.latestChapter, bct.lastUpdated, bct.views, bcm.comments, bgl.likes
ORDER BY lastUpdated DESC  NULLS LAST
`

type BookGroupsByAuthorRow struct {
	ID            int32       `json:"id"`
	Image         interface{} `json:"image"`
	Title         interface{} `json:"title"`
	Latestchapter interface{} `json:"latestchapter"`
	Lastupdated   interface{} `json:"lastupdated"`
	Views         interface{} `json:"views"`
	Comments      int64       `json:"comments"`
	Likes         interface{} `json:"likes"`
}

func (q *Queries) BookGroupsByAuthor(ctx context.Context, bookAuthorID int32) ([]BookGroupsByAuthorRow, error) {
	rows, err := q.db.Query(ctx, bookGroupsByAuthor, bookAuthorID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []BookGroupsByAuthorRow
	for rows.Next() {
		var i BookGroupsByAuthorRow
		if err := rows.Scan(
			&i.ID,
			&i.Image,
			&i.Title,
			&i.Latestchapter,
			&i.Lastupdated,
			&i.Views,
			&i.Comments,
			&i.Likes,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const delBookGroupAuthorsByAuthor = `-- name: DelBookGroupAuthorsByAuthor :exec
DELETE
FROM book_group_authors
WHERE book_author_id = $1
`

func (q *Queries) DelBookGroupAuthorsByAuthor(ctx context.Context, bookAuthorID int32) error {
	_, err := q.db.Exec(ctx, delBookGroupAuthorsByAuthor, bookAuthorID)
	return err
}

const delBookGroupAuthorsByBookGroup = `-- name: DelBookGroupAuthorsByBookGroup :exec
DELETE
FROM book_group_authors
WHERE book_group_id = $1
`

func (q *Queries) DelBookGroupAuthorsByBookGroup(ctx context.Context, bookGroupID int32) error {
	_, err := q.db.Exec(ctx, delBookGroupAuthorsByBookGroup, bookGroupID)
	return err
}

const deleteBookGroupAuthor = `-- name: DeleteBookGroupAuthor :exec
DELETE
FROM book_group_authors
WHERE book_group_id = $1
  AND book_author_id = $2
`

type DeleteBookGroupAuthorParams struct {
	BookGroupID  int32 `json:"bookGroupID"`
	BookAuthorID int32 `json:"bookAuthorID"`
}

func (q *Queries) DeleteBookGroupAuthor(ctx context.Context, arg DeleteBookGroupAuthorParams) error {
	_, err := q.db.Exec(ctx, deleteBookGroupAuthor, arg.BookGroupID, arg.BookAuthorID)
	return err
}

const getBookAuthor = `-- name: GetBookAuthor :one
SELECT ba.name,
       ba.description,
       i.path AS avatar
FROM book_authors ba
         LEFT JOIN images i on ba.avatar_image_id = i.id
WHERE ba.id=$1
`

type GetBookAuthorRow struct {
	Name        string         `json:"name"`
	Description sql.NullString `json:"description"`
	Avatar      sql.NullString `json:"avatar"`
}

func (q *Queries) GetBookAuthor(ctx context.Context, id int32) (GetBookAuthorRow, error) {
	row := q.db.QueryRow(ctx, getBookAuthor, id)
	var i GetBookAuthorRow
	err := row.Scan(&i.Name, &i.Description, &i.Avatar)
	return i, err
}

const insertBookGroupAuthor = `-- name: InsertBookGroupAuthor :one
INSERT INTO book_group_authors(book_group_id, book_author_id)
VALUES ($1, $2)
RETURNING book_group_id, book_author_id
`

type InsertBookGroupAuthorParams struct {
	BookGroupID  int32 `json:"bookGroupID"`
	BookAuthorID int32 `json:"bookAuthorID"`
}

func (q *Queries) InsertBookGroupAuthor(ctx context.Context, arg InsertBookGroupAuthorParams) (BookGroupAuthor, error) {
	row := q.db.QueryRow(ctx, insertBookGroupAuthor, arg.BookGroupID, arg.BookAuthorID)
	var i BookGroupAuthor
	err := row.Scan(&i.BookGroupID, &i.BookAuthorID)
	return i, err
}
