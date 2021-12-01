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

type Comment struct {
	Comment string `json:"comment" binding:"required"`
	UserName string `json:"userName" binding:"required"`
	UserId int32 `json:"userId" binding:"required"`
	UserAvatar string `json:"userAvatar" binding:"required"`
	TimePosted int64 `json:"timePosted" binding:"required"`
	ChapterId int32 `json:"chapterId"`
	ChapterNumber float64 `json:"chapterNumber"`
}

type CommentPage struct {
	LastPage int32 `json:"lastPage"`
	Comments []Comment `json:"comments"`
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

func GetCommentsHandler(c *gin.Context) {
	ctx := context.Background()
	queries := db.New(db.Pool())

	bookGroupIdString := c.Query("bookGroupId")
	bookChapterIdString := c.Query("bookChapterId")
	pageString := c.Query("page")

	if len(bookGroupIdString) == 0 && len(bookChapterIdString) == 0 {
		ReportError(c, errors.New("need book group or book chapter id"), "missing propertied", http.StatusBadRequest)
		return
	}

	var responseObj CommentPage

	var page int32
	if len(pageString) == 0 {
		page = 1
	} else {
		page64, err := strconv.ParseInt(pageString, 10, 32)
		if err != nil {
			ReportError(c, err, "error parsing page number", 500)
			return
		}
		page = int32(page64)
	}

	switch {
	case len(bookGroupIdString) == 0:
		bookChapterId64, err := strconv.ParseInt(bookChapterIdString, 10, 32)
		if err != nil {
			ReportError(c, err, "error parsing book chapter id", 500)
			return
		}
		chapterId := int32(bookChapterId64)

		//get last page
		totalChapterComments, err := queries.GetTotalBookChapterComments(ctx, sql.NullInt32{
			Int32: chapterId,
			Valid: true,
		})
		if totalChapterComments == 0 {
			responseObj.LastPage = 1
			break
		} else {
			if totalChapterComments % 20 != 0 {
				responseObj.LastPage = int32(totalChapterComments/20) + 1
			} else {
				responseObj.LastPage = int32(totalChapterComments/20)
			}
		}

		//get comments
		chapterComments, err := queries.GetBookChapterComments(ctx, db.GetBookChapterCommentsParams{
			BookChapterID: sql.NullInt32{
				Int32: chapterId,
				Valid: true,
			},
			Offset:        20 * (page - 1),
		})
		switch {
		case len(chapterComments) == 0:
		case len(chapterComments) > 0:
			for _, comment := range chapterComments {
				userPosted, err := queries.GetCommenter(ctx, comment.ID)
				if err != nil {
					ReportError(c, err, "error getting commenter", 500)
					return
				}
				chapter, err := queries.GetCommentChapterInfo(ctx, comment.ID)
				if err != nil {
					ReportError(c, err, "error getting chapter", 500)
					return
				}
				responseObj.Comments = append(responseObj.Comments, Comment{
					Comment:       comment.Content,
					UserName:      userPosted.UserName.String,
					UserId:        userPosted.ID,
					UserAvatar:    userPosted.Path,
					TimePosted:    comment.PostedTime.UnixMicro(),
					ChapterId:     chapterId,
					ChapterNumber: chapter.ChapterNumber,
				})
			}
		default:
			ReportError(c, err, "error getting comment", 500)
			return
		}

	case len(bookChapterIdString) == 0:
		bookGroupId64, err := strconv.ParseInt(bookGroupIdString, 10, 32)
		if err != nil {
			ReportError(c, err, "error parsing book group id", 500)
			return
		}
		bookId := int32(bookGroupId64)

		//get last page
		totalBookComments, err := queries.GetTotalBookGroupComments(ctx, sql.NullInt32{
			Int32: bookId,
			Valid: true,
		})
		if totalBookComments == 0 {
			responseObj.LastPage = 1
			break
		} else {
			if totalBookComments % 20 != 0 {
				responseObj.LastPage = int32(totalBookComments/20) + 1
			} else {
				responseObj.LastPage = int32(totalBookComments/20)
			}
		}

		//get comments
		bookComments, err := queries.GetBookGroupComments(ctx, db.GetBookGroupCommentsParams{
			BookGroupID: sql.NullInt32{
				Int32: bookId,
				Valid: true,
			},
			Offset:        20 * (page - 1),
		})
		switch {
		case len(bookComments) == 0:
		case len(bookComments) > 0 && err == nil:
			for _, comment := range bookComments {
				userPosted, err := queries.GetCommenter(ctx, comment.ID)
				if err != nil {
					ReportError(c, err, "error getting commenter", 500)
					return
				}
				chapter, err := queries.GetCommentChapterInfo(ctx, comment.ID)
				if err != nil {
					ReportError(c, err, "error getting chapter", 500)
					return
				}
				responseObj.Comments = append(responseObj.Comments, Comment{
					Comment:       comment.Content,
					UserName:      userPosted.UserName.String,
					UserId:        userPosted.ID,
					UserAvatar:    userPosted.Path,
					TimePosted:    comment.PostedTime.UnixMicro(),
					ChapterId:     chapter.ID,
					ChapterNumber: chapter.ChapterNumber,
				})
			}
		default:
			ReportError(c, err, "error getting comment", 500)
			return
		}
	}
	c.JSON(200, responseObj)
}