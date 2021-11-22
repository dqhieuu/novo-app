// Code generated by sqlc. DO NOT EDIT.
// source: comments.sql

package db

import (
	"context"
	"database/sql"
)

const addComment = `-- name: AddComment :exec
INSERT INTO book_comments(user_id, book_group_id, book_chapter_id, content) VALUES ($1, $2, $3, $4)
`

type AddCommentParams struct {
	UserID        int32         `json:"user_id"`
	BookGroupID   sql.NullInt32 `json:"book_group_id"`
	BookChapterID sql.NullInt32 `json:"book_chapter_id"`
	Content       string        `json:"content"`
}

func (q *Queries) AddComment(ctx context.Context, arg AddCommentParams) error {
	_, err := q.db.Exec(ctx, addComment,
		arg.UserID,
		arg.BookGroupID,
		arg.BookChapterID,
		arg.Content,
	)
	return err
}

const deleteComment = `-- name: DeleteComment :exec
DELETE FROM book_comments WHERE id = $1
`

func (q *Queries) DeleteComment(ctx context.Context, id int32) error {
	_, err := q.db.Exec(ctx, deleteComment, id)
	return err
}

const updateComment = `-- name: UpdateComment :exec
UPDATE book_comments SET content = $2 WHERE id = $1
`

type UpdateCommentParams struct {
	ID      int32  `json:"id"`
	Content string `json:"content"`
}

func (q *Queries) UpdateComment(ctx context.Context, arg UpdateCommentParams) error {
	_, err := q.db.Exec(ctx, updateComment, arg.ID, arg.Content)
	return err
}