// Code generated by sqlc. DO NOT EDIT.
// source: book_group.sql

package db

import (
	"context"
	"database/sql"
)

const bookGroupById = `-- name: BookGroupById :one
SELECT id, title, description, date_created, owner_id, primary_cover_art_id
FROM book_groups
WHERE id = $1
`

func (q *Queries) BookGroupById(ctx context.Context, id int32) (BookGroup, error) {
	row := q.db.QueryRow(ctx, bookGroupById, id)
	var i BookGroup
	err := row.Scan(
		&i.ID,
		&i.Title,
		&i.Description,
		&i.DateCreated,
		&i.OwnerID,
		&i.PrimaryCoverArtID,
	)
	return i, err
}

const bookGroupsByTitle = `-- name: BookGroupsByTitle :many
SELECT id, title, description, date_created, owner_id, primary_cover_art_id
FROM book_groups
WHERE  LOWER(title) LIKE '%' || $1 || '%'
ORDER BY id
OFFSET $2 ROWS
    FETCH FIRST $3 ROWS ONLY
`

type BookGroupsByTitleParams struct {
	Column1 sql.NullString `json:"column1"`
	Offset  int32          `json:"offset"`
	Limit   int32          `json:"limit"`
}

func (q *Queries) BookGroupsByTitle(ctx context.Context, arg BookGroupsByTitleParams) ([]BookGroup, error) {
	rows, err := q.db.Query(ctx, bookGroupsByTitle, arg.Column1, arg.Offset, arg.Limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []BookGroup
	for rows.Next() {
		var i BookGroup
		if err := rows.Scan(
			&i.ID,
			&i.Title,
			&i.Description,
			&i.DateCreated,
			&i.OwnerID,
			&i.PrimaryCoverArtID,
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

const deleteBookGroup = `-- name: DeleteBookGroup :exec
DELETE FROM book_groups
WHERE id = $1
`

func (q *Queries) DeleteBookGroup(ctx context.Context, id int32) error {
	_, err := q.db.Exec(ctx, deleteBookGroup, id)
	return err
}

const insertBookGroup = `-- name: InsertBookGroup :one
INSERT INTO book_groups(title, description,owner_id,primary_cover_art_id)
VALUES ($1, $2,$3,$4)
RETURNING id, title, description, date_created, owner_id, primary_cover_art_id
`

type InsertBookGroupParams struct {
	Title             string         `json:"title"`
	Description       sql.NullString `json:"description"`
	OwnerID           int32          `json:"ownerID"`
	PrimaryCoverArtID sql.NullInt32  `json:"primaryCoverArtID"`
}

func (q *Queries) InsertBookGroup(ctx context.Context, arg InsertBookGroupParams) (BookGroup, error) {
	row := q.db.QueryRow(ctx, insertBookGroup,
		arg.Title,
		arg.Description,
		arg.OwnerID,
		arg.PrimaryCoverArtID,
	)
	var i BookGroup
	err := row.Scan(
		&i.ID,
		&i.Title,
		&i.Description,
		&i.DateCreated,
		&i.OwnerID,
		&i.PrimaryCoverArtID,
	)
	return i, err
}

const latestBookGroups = `-- name: LatestBookGroups :many
SELECT bg.id id,
       (array_agg(i.path))[1] AS image,
       bg.title AS title,
       bct.latestChapter,
       bct.lastUpdated,
       bct.views,
       bcm.comments,
       bgl.likes
FROM book_groups AS bg
         LEFT JOIN Lateral (
    SELECT count(bcm.id) AS comments
    FROM book_comments bcm
    WHERE bcm.book_group_id = bg.id
    ) bcm ON TRUE
         LEFT JOIN Lateral (
    SELECT coalesce(sum(bgl.point), 0) AS likes
    FROM book_group_likes bgl
    WHERE bgl.book_group_id = bg.id
    ) bgl ON TRUE
         LEFT JOIN LATERAL (
    SELECT (array_agg(bct.chapter_number ORDER BY bct.date_created DESC))[1] AS latestChapter,
           MAX(bct.date_created) AS lastUpdated,
           coalesce(sum(bcv.count),0) AS views
    FROM book_chapters bct
             LEFT JOIN book_chapter_views bcv
                       ON bct.id = bcv.book_chapter_id
    WHERE bct.book_group_id = bg.id
    ) bct ON TRUE
         LEFT JOIN images i ON bg.primary_cover_art_id = i.id
GROUP BY bg.id, bg.title, i.path, bct.latestChapter, bct.lastUpdated, bct.views, bcm.comments, bgl.likes
ORDER BY lastUpdated DESC  NULLS LAST
OFFSET $1 ROWS FETCH FIRST $2 ROWS ONLY
`

type LatestBookGroupsParams struct {
	Offset int32 `json:"offset"`
	Limit  int32 `json:"limit"`
}

type LatestBookGroupsRow struct {
	ID            int32       `json:"id"`
	Image         interface{} `json:"image"`
	Title         string      `json:"title"`
	Latestchapter interface{} `json:"latestchapter"`
	Lastupdated   interface{} `json:"lastupdated"`
	Views         interface{} `json:"views"`
	Comments      int64       `json:"comments"`
	Likes         interface{} `json:"likes"`
}

func (q *Queries) LatestBookGroups(ctx context.Context, arg LatestBookGroupsParams) ([]LatestBookGroupsRow, error) {
	rows, err := q.db.Query(ctx, latestBookGroups, arg.Offset, arg.Limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []LatestBookGroupsRow
	for rows.Next() {
		var i LatestBookGroupsRow
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

const numberBookGroup = `-- name: NumberBookGroup :one
SELECT COUNT(id)
FROM book_groups
`

func (q *Queries) NumberBookGroup(ctx context.Context) (int64, error) {
	row := q.db.QueryRow(ctx, numberBookGroup)
	var count int64
	err := row.Scan(&count)
	return count, err
}

const numberBookGroupSearchResult = `-- name: NumberBookGroupSearchResult :one
SELECT COUNT(id)
FROM book_groups
WHERE title LIKE '%' || $1 || '%'
`

func (q *Queries) NumberBookGroupSearchResult(ctx context.Context, query sql.NullString) (int64, error) {
	row := q.db.QueryRow(ctx, numberBookGroupSearchResult, query)
	var count int64
	err := row.Scan(&count)
	return count, err
}

const searchResult = `-- name: SearchResult :many
SELECT bg.id id,
       (array_agg(i.path))[1] AS image,
       bg.title AS title,
       bct.latestChapter,
       bct.lastUpdated,
       bct.views,
       bcm.comments,
       bgl.likes
FROM book_groups AS bg
         LEFT JOIN Lateral (
    SELECT count(bcm.id) AS comments
    FROM book_comments bcm
    WHERE bcm.book_group_id = bg.id
    ) bcm ON TRUE
         LEFT JOIN Lateral (
    SELECT coalesce(sum(bgl.point), 0) AS likes
    FROM book_group_likes bgl
    WHERE bgl.book_group_id = bg.id
    ) bgl ON TRUE
         LEFT JOIN LATERAL (
    SELECT (array_agg(bct.chapter_number ORDER BY bct.date_created DESC))[1] AS latestChapter,
           MAX(bct.date_created) AS lastUpdated,
           coalesce(sum(bcv.count),0) AS views
    FROM book_chapters bct
             LEFT JOIN book_chapter_views bcv
                       ON bct.id = bcv.book_chapter_id
    WHERE bct.book_group_id = bg.id
    ) bct ON TRUE
         LEFT JOIN images i ON bg.primary_cover_art_id = i.id
WHERE bg.title LIKE '%'||$3||'%'
GROUP BY bg.id, bg.title, i.path, bct.latestChapter, bct.lastUpdated, bct.views, bcm.comments, bgl.likes
ORDER BY lastUpdated DESC  NULLS LAST
OFFSET $1 ROWS FETCH FIRST $2 ROWS ONLY
`

type SearchResultParams struct {
	Offset int32          `json:"offset"`
	Limit  int32          `json:"limit"`
	Query  sql.NullString `json:"query"`
}

type SearchResultRow struct {
	ID            int32       `json:"id"`
	Image         interface{} `json:"image"`
	Title         string      `json:"title"`
	Latestchapter interface{} `json:"latestchapter"`
	Lastupdated   interface{} `json:"lastupdated"`
	Views         interface{} `json:"views"`
	Comments      int64       `json:"comments"`
	Likes         interface{} `json:"likes"`
}

func (q *Queries) SearchResult(ctx context.Context, arg SearchResultParams) ([]SearchResultRow, error) {
	rows, err := q.db.Query(ctx, searchResult, arg.Offset, arg.Limit, arg.Query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []SearchResultRow
	for rows.Next() {
		var i SearchResultRow
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

const searchSuggestion = `-- name: SearchSuggestion :many
SELECT bg.title AS title,
       bg.id AS id,
       (array_agg(i.path))[1] AS image,
       (array_agg(bct.chapter_number ORDER BY bct.date_created DESC))[1] AS latestChapter
FROM book_groups AS bg
         LEFT JOIN images i on bg.primary_cover_art_id = i.id
         LEFT JOIN book_chapters bct on bg.id = bct.book_group_id
WHERE bg.title LIKE '%'||$1||'%'
GROUP BY bg.id
LIMIT 5
`

type SearchSuggestionRow struct {
	Title         string      `json:"title"`
	ID            int32       `json:"id"`
	Image         interface{} `json:"image"`
	Latestchapter interface{} `json:"latestchapter"`
}

func (q *Queries) SearchSuggestion(ctx context.Context, query sql.NullString) ([]SearchSuggestionRow, error) {
	rows, err := q.db.Query(ctx, searchSuggestion, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []SearchSuggestionRow
	for rows.Next() {
		var i SearchSuggestionRow
		if err := rows.Scan(
			&i.Title,
			&i.ID,
			&i.Image,
			&i.Latestchapter,
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

const updateBookGroup = `-- name: UpdateBookGroup :exec
UPDATE book_groups
SET title = $2,
    description=$3,
    owner_id=$4
WHERE id = $1
`

type UpdateBookGroupParams struct {
	ID          int32          `json:"id"`
	Title       string         `json:"title"`
	Description sql.NullString `json:"description"`
	OwnerID     int32          `json:"ownerID"`
}

func (q *Queries) UpdateBookGroup(ctx context.Context, arg UpdateBookGroupParams) error {
	_, err := q.db.Exec(ctx, updateBookGroup,
		arg.ID,
		arg.Title,
		arg.Description,
		arg.OwnerID,
	)
	return err
}
