package server

import (
	"database/sql"
	"github.com/dqhieuu/novo-app/db"
	"github.com/gin-gonic/gin"
	"log"
	"strconv"
)

func InsertComment(c *gin.Context) {
	userId, err := strconv.ParseInt(c.PostForm("userId"), 10, 32)
	if err != nil {
		log.Fatalf("Error parsing user ID: %s\n", err)
	}
	bookId, err := strconv.ParseInt(c.PostForm("bookId"), 10, 32)
	if err != nil {
		log.Fatalf("Error parsing book group ID: %s\n", err)
	}
	chapterId, err := strconv.ParseInt(c.PostForm("chapterId"), 10, 32)
	if err != nil {
		log.Fatalf("Error parsing chapter ID: %s\n", err)
	}
	content := c.PostForm("content")
	err = db.New(db.Pool()).AddComment(c, db.AddCommentParams{
		UserID:        int32(userId),
		BookGroupID:   sql.NullInt32{
			Int32: int32(bookId),
			Valid: true,
		},
		BookChapterID: sql.NullInt32{
			Int32: int32(chapterId),
			Valid: true,
		},
		Content:       content,
	})

	if err != nil {
		log.Fatalf("Error adding comment: %s\n", err)
	}
}

func EditComment(c *gin.Context) {
	userId, err := strconv.ParseInt(c.PostForm("userId"), 10, 32)
	if err != nil {
		log.Fatalf("Error parsing user ID: %s\n", err)
	}
	bookId, err := strconv.ParseInt(c.PostForm("bookId"), 10, 32)
	if err != nil {
		log.Fatalf("Error parsing book group ID: %s\n", err)
	}
	chapterId, err := strconv.ParseInt(c.PostForm("chapterId"), 10, 32)
	if err != nil {
		log.Fatalf("Error parsing chapter ID: %s\n", err)
	}
	content := c.PostForm("content")
	err = db.New(db.Pool()).UpdateComment(c, db.UpdateCommentParams{
		UserID:        int32(userId),
		BookGroupID:   sql.NullInt32{
			Int32: int32(bookId),
			Valid: true,
		},
		BookChapterID: sql.NullInt32{
			Int32: int32(chapterId),
			Valid: true,
		},
		Content:       content,
	})

	if err != nil {
		log.Fatalf("Error updating comment: %s\n", err)
	}
}

func RemoveComment(c *gin.Context) {
	userId, err := strconv.ParseInt(c.PostForm("userId"), 10, 32)
	if err != nil {
		log.Fatalf("Error parsing user ID: %s\n", err)
	}
	bookId, err := strconv.ParseInt(c.PostForm("bookId"), 10, 32)
	if err != nil {
		log.Fatalf("Error parsing book group ID: %s\n", err)
	}
	chapterId, err := strconv.ParseInt(c.PostForm("chapterId"), 10, 32)
	if err != nil {
		log.Fatalf("Error parsing chapter ID: %s\n", err)
	}
	err = db.New(db.Pool()).DeleteComment(c, db.DeleteCommentParams{
		UserID:        int32(userId),
		BookGroupID:   sql.NullInt32{
			Int32: int32(bookId),
			Valid: true,
		},
		BookChapterID: sql.NullInt32{
			Int32: int32(chapterId),
			Valid: true,
		},
	})

	if err != nil {
		log.Fatalf("Error deleting comment: %s\n", err)
	}
}