// Code generated by sqlc. DO NOT EDIT.
// source: book_chapter.sql

package db

import (
	"context"
	"database/sql"

	"github.com/jackc/pgtype"
)

const bookChapterById = `-- name: BookChapterById :one
SELECT id, date_created, chapter_number, description, text_context, type, book_group_id, owner_id
FROM book_chapters
WHERE id = $1
`

func (q *Queries) BookChapterById(ctx context.Context, id int32) (BookChapter, error) {
	row := q.db.QueryRow(ctx, bookChapterById, id)
	var i BookChapter
	err := row.Scan(
		&i.ID,
		&i.DateCreated,
		&i.ChapterNumber,
		&i.Description,
		&i.TextContext,
		&i.Type,
		&i.BookGroupID,
		&i.OwnerID,
	)
	return i, err
}

const bookChaptersByBookGroupId = `-- name: BookChaptersByBookGroupId :many
SELECT id, date_created, chapter_number, description, text_context, type, book_group_id, owner_id
FROM book_chapters
WHERE book_group_id = $1
ORDER BY id
OFFSET $2 ROWS FETCH FIRST $3 ROWS ONLY
`

type BookChaptersByBookGroupIdParams struct {
	BookGroupID int32 `json:"bookGroupID"`
	Offset      int32 `json:"offset"`
	Limit       int32 `json:"limit"`
}

func (q *Queries) BookChaptersByBookGroupId(ctx context.Context, arg BookChaptersByBookGroupIdParams) ([]BookChapter, error) {
	rows, err := q.db.Query(ctx, bookChaptersByBookGroupId, arg.BookGroupID, arg.Offset, arg.Limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []BookChapter
	for rows.Next() {
		var i BookChapter
		if err := rows.Scan(
			&i.ID,
			&i.DateCreated,
			&i.ChapterNumber,
			&i.Description,
			&i.TextContext,
			&i.Type,
			&i.BookGroupID,
			&i.OwnerID,
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

const deleteBookChapterByBookGroupId = `-- name: DeleteBookChapterByBookGroupId :exec
DELETE
FROM book_chapters
WHERE book_group_id = $1
`

func (q *Queries) DeleteBookChapterByBookGroupId(ctx context.Context, bookGroupID int32) error {
	_, err := q.db.Exec(ctx, deleteBookChapterByBookGroupId, bookGroupID)
	return err
}

const deleteBookChapterById = `-- name: DeleteBookChapterById :exec
DELETE
FROM book_chapters
WHERE id = $1
`

func (q *Queries) DeleteBookChapterById(ctx context.Context, id int32) error {
	_, err := q.db.Exec(ctx, deleteBookChapterById, id)
	return err
}

const insertBookChapter = `-- name: InsertBookChapter :one
INSERT INTO book_chapters(chapter_number,description,text_context,type,book_group_id,owner_id)
VALUES ($1,$2,$3,$4,$5,$6)
RETURNING id, date_created, chapter_number, description, text_context, type, book_group_id, owner_id
`

type InsertBookChapterParams struct {
	ChapterNumber pgtype.Numeric `json:"chapterNumber"`
	Description   sql.NullString `json:"description"`
	TextContext   sql.NullString `json:"textContext"`
	Type          string         `json:"type"`
	BookGroupID   int32          `json:"bookGroupID"`
	OwnerID       int32          `json:"ownerID"`
}

func (q *Queries) InsertBookChapter(ctx context.Context, arg InsertBookChapterParams) (BookChapter, error) {
	row := q.db.QueryRow(ctx, insertBookChapter,
		arg.ChapterNumber,
		arg.Description,
		arg.TextContext,
		arg.Type,
		arg.BookGroupID,
		arg.OwnerID,
	)
	var i BookChapter
	err := row.Scan(
		&i.ID,
		&i.DateCreated,
		&i.ChapterNumber,
		&i.Description,
		&i.TextContext,
		&i.Type,
		&i.BookGroupID,
		&i.OwnerID,
	)
	return i, err
}

const updateBookChapter = `-- name: UpdateBookChapter :exec
UPDATE book_chapters
SET chapter_number=$2,
    description=$3,
    text_context=$4,
    type=$5,
    book_group_id=$6,
    owner_id=$7
WHERE id = $1
`

type UpdateBookChapterParams struct {
	ID            int32          `json:"id"`
	ChapterNumber pgtype.Numeric `json:"chapterNumber"`
	Description   sql.NullString `json:"description"`
	TextContext   sql.NullString `json:"textContext"`
	Type          string         `json:"type"`
	BookGroupID   int32          `json:"bookGroupID"`
	OwnerID       int32          `json:"ownerID"`
}

func (q *Queries) UpdateBookChapter(ctx context.Context, arg UpdateBookChapterParams) error {
	_, err := q.db.Exec(ctx, updateBookChapter,
		arg.ID,
		arg.ChapterNumber,
		arg.Description,
		arg.TextContext,
		arg.Type,
		arg.BookGroupID,
		arg.OwnerID,
	)
	return err
}
