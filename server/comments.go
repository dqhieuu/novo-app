package server

import (
	"context"
	"database/sql"
	"errors"
	jwt "github.com/appleboy/gin-jwt/v2"
	"github.com/dqhieuu/novo-app/db"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"regexp"
	"strconv"
)

type CommentParams struct {
	UserId    int32
	BookId    *int32
	ChapterId *int32
	Content   string
}

func InsertComment(params CommentParams) error {
	if params.BookId == nil {
		return errors.New("book group id is required")
	}

	var chapterId sql.NullInt32
	if params.ChapterId == nil {
		chapterId.Valid = false
	} else {
		chapterId.Int32 = *params.ChapterId
		chapterId.Valid = true
	}

	err := db.New(db.Pool()).AddComment(context.Background(), db.AddCommentParams{
		UserID: params.UserId,
		BookGroupID: sql.NullInt32{
			Int32: *params.BookId,
			Valid: true,
		},
		BookChapterID: chapterId,
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

func CreateCommentHandler(c *gin.Context){
	var comment string
	reg := regexp.MustCompile(`(\r\n|\n){3,}`)

	err := c.ShouldBindJSON(comment)
	if err != nil {
		log.Printf("error parsing json: %s\n", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "error parsing json",
		})
		return
	}
	comment = reg.ReplaceAllString(comment, "\n\n")
	if len(comment) < 10 || len(comment) > 500 {
		log.Println("invalid comment length")
		c.JSON(500, gin.H{
			"error": "invalid comment length",
		})
		return
	}

	//get book group id
	bookGroupId := c.Query("bookGroupId")
	if len(bookGroupId) == 0 {
		//maybe check some invalid string in the future
		log.Println("missing book group id")
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "missing book group id",
		})
		return
	}
	bookGroupId64, err := strconv.ParseInt(bookGroupId, 10, 32)
	if err != nil {
		log.Printf("error parsing book group id: %s\n", err)
		c.JSON(500, gin.H{
			"error": err,
		})
		return
	}
	bookId := int32(bookGroupId64)

	//get book chapter id (if exist)
	bookChapterId := c.Query("bookChapterId")
	var chapterId *int32
	var chapterIdValue int32
	if len(bookChapterId) > 0 {
		//maybe have some more advance string checking in the future
		bookChapterId64, err := strconv.ParseInt(bookChapterId, 10, 32)
		if err != nil {
			log.Printf("error parsing book group id: %s\n", err)
			c.JSON(500, gin.H{
				"error": err,
			})
		} else {
			chapterIdValue = int32(bookChapterId64)
			chapterId = &chapterIdValue
		}
	}

	//inserting comment
	extract := jwt.ExtractClaims(c)

	err = InsertComment(CommentParams{
		UserId:    int32(extract[UserIdClaimKey].(float64)),
		BookId:    &bookId,
		ChapterId: chapterId,
		Content:   comment,
	})
	if err != nil {
		log.Printf("error inserting comment: %s\n", err)
		c.JSON(500, gin.H{
			"error": err,
		})
		return
	}
	c.JSON(200, gin.H{
		"message": "insert comment successful",
	})
}
