package server

import (
	"context"
	"database/sql"
	"errors"
	jwt "github.com/appleboy/gin-jwt/v2"
	"github.com/dqhieuu/novo-app/db"
	"github.com/gin-gonic/gin"
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
	Comment       string  `json:"comment" binding:"required"`
	UserName      string  `json:"userName" binding:"required"`
	UserId        int32   `json:"userId" binding:"required"`
	UserAvatar    string  `json:"userAvatar" binding:"required"`
	TimePosted    int64   `json:"timePosted" binding:"required"`
	ChapterId     int32   `json:"chapterId"`
	ChapterNumber float64 `json:"chapterNumber"`
}

type CommentPage struct {
	LastPage int32     `json:"lastPage"`
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
		UserID:        params.UserId,
		BookGroupID:   *params.BookId,
		BookChapterID: chapterId,
		Content:       params.Content,
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

func CreateCommentHandler(c *gin.Context) {
	var comment string
	reg := regexp.MustCompile(`(\r\n|\n){3,}`)

	err := c.ShouldBindJSON(comment)
	if err != nil {
		ReportError(c, err, "error parsing json", http.StatusBadRequest)
		return
	}
	comment = reg.ReplaceAllString(comment, "\n\n")
	if len(comment) < 10 || len(comment) > 500 || HasControlCharacters(comment) || CheckEmptyString(comment) {
		ReportError(c, errors.New("invalid comment"), "error", http.StatusBadRequest)
		return
	}

	//get book group id
	bookGroupId := c.Query("bookGroupId")
	if len(bookGroupId) == 0 {
		//maybe check some invalid string in the future
		ReportError(c, errors.New("missing book group id"), "error", http.StatusBadRequest)
		return
	}
	bookGroupId64, err := strconv.ParseInt(bookGroupId, 10, 32)
	if err != nil {
		ReportError(c, err, "error parsing book group id", 500)
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
			ReportError(c, err, "error parsing book chapter id", 500)
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
		ReportError(c, err, "error inserting comment", 500)
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
	case len(bookChapterIdString) != 0:
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
			if totalChapterComments%20 != 0 {
				responseObj.LastPage = int32(totalChapterComments/20) + 1
			} else {
				responseObj.LastPage = int32(totalChapterComments / 20)
			}
		}

		//get comments
		chapterComments, err := queries.GetBookChapterComments(ctx, db.GetBookChapterCommentsParams{
			BookChapterID: sql.NullInt32{
				Int32: chapterId,
				Valid: true,
			},
			Offset: 20 * (page - 1),
		})
		if err != nil {
			ReportError(c, err, "error getting comment", 500)
			return
		}
		if len(chapterComments) > 0 {
			for _, comment := range chapterComments {
				responseObj.Comments = append(responseObj.Comments, Comment{
					Comment:       comment.Content,
					UserName:      comment.UserName.String,
					UserId:        comment.Userid,
					UserAvatar:    comment.Avatarpath.String,
					TimePosted:    comment.PostedTime.UnixMicro(),
					ChapterId:     chapterId,
					ChapterNumber: comment.ChapterNumber.Float64,
				})
			}
		} else {
			responseObj.Comments = make([]Comment, 0)
		}

	case len(bookGroupIdString) != 0:
		bookGroupId64, err := strconv.ParseInt(bookGroupIdString, 10, 32)
		if err != nil {
			ReportError(c, err, "error parsing book group id", 500)
			return
		}
		bookId := int32(bookGroupId64)

		//get last page
		totalBookComments, err := queries.GetTotalBookGroupComments(ctx, bookId)
		if totalBookComments == 0 {
			responseObj.LastPage = 1
			break
		} else {
			if totalBookComments%20 != 0 {
				responseObj.LastPage = int32(totalBookComments/20) + 1
			} else {
				responseObj.LastPage = int32(totalBookComments / 20)
			}
		}

		//get comments
		bookComments, err := queries.GetBookGroupComments(ctx, db.GetBookGroupCommentsParams{
			BookGroupID: bookId,
			Offset:      20 * (page - 1),
		})
		if err != nil {
			ReportError(c, err, "error getting comment", 500)
			return
		}
		if len(bookComments) > 0 {
			for _, comment := range bookComments {
				responseObj.Comments = append(responseObj.Comments, Comment{
					Comment:       comment.Content,
					UserName:      comment.UserName.String,
					UserId:        comment.Userid,
					UserAvatar:    comment.Avatarpath.String,
					TimePosted:    comment.PostedTime.UnixMicro(),
					ChapterId:     comment.Chapterid.Int32,
					ChapterNumber: comment.ChapterNumber.Float64,
				})
			}
		} else {
			responseObj.Comments = make([]Comment, 0)
		}
	}
	c.JSON(200, responseObj)
}

<<<<<<< Updated upstream
func CountCommentInBookGroup(bookGroupId int32) (int32, error) {
	ctx := context.Background()
	queries := db.New(db.Pool())
	cnt, err := queries.CountCommentInBookGroup(ctx, sql.NullInt32{
		Int32: bookGroupId,
		Valid: bookGroupId > 0,
	})
	if err != nil {
		return 0, err
	}
	return int32(cnt), nil
=======
func EditCommentHandler(c *gin.Context) {
	ctx := context.Background()
	queries := db.New(db.Pool())

	commentIdString := c.Param("commentId")
	commentId64, err := strconv.ParseInt(commentIdString, 10, 32)
	if err != nil {
		ReportError(c, err, "error parsing comment id", 500)
		return
	}

	check, err := queries.CheckIfCommentExist(ctx, int32(commentId64))
	if err != nil {
		ReportError(c, err, "internal error", 500)
		return
	}
	if !check {
		ReportError(c, errors.New("comment does not exist"), "error", http.StatusBadRequest)
		return
	}

	var content string
	err = c.ShouldBindJSON(content)
	if err != nil {
		ReportError(c, err, "error parsing json", http.StatusBadRequest)
		return
	}

	reg := regexp.MustCompile(`(\r\n|\n){3,}`)
	content = reg.ReplaceAllString(content, "\n\n")
	if len(content) < 10 || len(content) > 500 || HasControlCharacters(content) || CheckEmptyString(content) {
		ReportError(c, errors.New("invalid comment"), "error", http.StatusBadRequest)
		return
	}

	err = queries.UpdateComment(ctx, db.UpdateCommentParams{
		ID:      int32(commentId64),
		Content: content,
	})

	if err != nil {
		ReportError(c, err, "error updating comment", 500)
		return
	}

	c.JSON(200, gin.H{
		"message": "success",
	})
}

func DeleteCommentHandler(c *gin.Context) {
	ctx := context.Background()
	queries := db.New(db.Pool())

	commentIdString := c.Param("commentId")
	commentId64, err := strconv.ParseInt(commentIdString, 10, 32)
	if err != nil {
		ReportError(c, err, "error parsing comment id", 500)
		return
	}

	check, err := queries.CheckIfCommentExist(ctx, int32(commentId64))
	if err != nil {
		ReportError(c, err, "internal error", 500)
		return
	}
	if !check {
		ReportError(c, errors.New("comment does not exist"), "error", http.StatusBadRequest)
		return
	}

	err = queries.DeleteComment(ctx, int32(commentId64))
	if err != nil {
		ReportError(c, err, "error deleting comment", 500)
		return
	}

	c.JSON(200, gin.H{
		"message": "success",
	})
>>>>>>> Stashed changes
}
