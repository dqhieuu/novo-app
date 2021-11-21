package server

import (
	"context"
	"database/sql"
	"errors"
	"github.com/dqhieuu/novo-app/db"
)

type CommentParams struct {
	UserId    int32
	BookId    int32
	ChapterId int32
	Content   string
}

func InsertComment(params CommentParams) error {
	err := db.New(db.Pool()).AddComment(context.Background(), db.AddCommentParams{
		UserID: params.UserId,
		BookGroupID: sql.NullInt32{
			Int32: params.BookId,
			Valid: true,
		},
		BookChapterID: sql.NullInt32{
			Int32: params.ChapterId,
			Valid: true,
		},
		Content: params.Content,
	})

	if err != nil {
		return errors.New("error adding comment: " + err.Error())
	}
	return nil
}

func EditComment(commentId int32, content string) error {
	err := db.New(db.Pool()).UpdateComment(context.Background(), db.UpdateCommentParams{
		ID:      commentId,
		Content: content,
	})

	if err != nil {
		return errors.New("error updating comment: " + err.Error())
	}
	return nil
}

func RemoveComment(commentId int32) error {
	err := db.New(db.Pool()).DeleteComment(context.Background(), commentId)

	if err != nil {
		return errors.New("error deleting comment: " + err.Error())
	}
	return nil
}

func CommentsByBookGroup(bookGroupId int32, page int) {

}

func CommentsByBookChapter(bookChapterId int32, page int) {

}
