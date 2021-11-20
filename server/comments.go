package server

import (
	"database/sql"
	"github.com/dqhieuu/novo-app/db"
	"github.com/gin-gonic/gin"
	"log"
)

type CommentParams struct{
	UserId int32
	BookId int32
	ChapterId int32
	Content string
}

func InsertComment(c *gin.Context, params CommentParams) {
	err := db.New(db.Pool()).AddComment(c, db.AddCommentParams{
		UserID:        params.UserId,
		BookGroupID:   sql.NullInt32{
			Int32: params.BookId,
			Valid: true,
		},
		BookChapterID: sql.NullInt32{
			Int32: params.ChapterId,
			Valid: true,
		},
		Content:       params.Content,
	})

	if err != nil {
		log.Fatalf("Error adding comment: %s\n", err)
	}
}

func EditComment(c *gin.Context, params CommentParams) {
	err := db.New(db.Pool()).UpdateComment(c, db.UpdateCommentParams{
		UserID:        params.UserId,
		BookGroupID:   sql.NullInt32{
			Int32: params.BookId,
			Valid: true,
		},
		BookChapterID: sql.NullInt32{
			Int32: params.ChapterId,
			Valid: true,
		},
		Content:       params.Content,
	})

	if err != nil {
		log.Fatalf("Error updating comment: %s\n", err)
	}
}

func RemoveComment(c *gin.Context, params CommentParams) {
	err := db.New(db.Pool()).DeleteComment(c, db.DeleteCommentParams{
		UserID:        params.UserId,
		BookGroupID:   sql.NullInt32{
			Int32: params.BookId,
			Valid: true,
		},
		BookChapterID: sql.NullInt32{
			Int32: params.ChapterId,
			Valid: true,
		},
	})

	if err != nil {
		log.Fatalf("Error deleting comment: %s\n", err)
	}
}