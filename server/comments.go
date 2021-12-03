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
	BookId    int32
	ChapterId *int32
	Content   string
}

type Comment struct {
	Id            int32   `json:"id" binding:"required"`
	Comment       string  `json:"comment" binding:"required"`
	UserName      string  `json:"userName" binding:"required"`
	UserId        int32   `json:"userId" binding:"required"`
	UserAvatar    interface{}  `json:"userAvatar" binding:"required"`
	TimePosted    int64   `json:"timePosted" binding:"required"`
	ChapterId     interface{}   `json:"chapterId"`
	ChapterNumber interface{} `json:"chapterNumber"`
}

type CommentPage struct {
	LastPage int32     `json:"lastPage"`
	Comments []Comment `json:"comments"`
}

type PostComment struct {
	Comment string `json:"comment" binding:"required"`
}

func InsertComment(params CommentParams) error {
	var chapterId sql.NullInt32
	if params.ChapterId == nil {
		chapterId.Valid = false
	} else {
		chapterId.Int32 = *params.ChapterId
		chapterId.Valid = true
	}

	err := db.New(db.Pool()).AddComment(context.Background(), db.AddCommentParams{
		UserID:        params.UserId,
		BookGroupID:   params.BookId,
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
	ctx := context.Background()
	queries := db.New(db.Pool())

	var postComment PostComment
	reg := regexp.MustCompile(`(\r\n|\n){3,}`)

	err := c.ShouldBindJSON(&postComment)
	if err != nil {
		ReportError(c, err, "error parsing json", http.StatusBadRequest)
		return
	}
	comment := postComment.Comment

	comment = reg.ReplaceAllString(comment, "\n\n")
	if len(comment) < 10 || len(comment) > 500 || HasControlCharacters(comment) || CheckEmptyString(comment) {
		ReportError(c, errors.New("invalid comment"), "error", http.StatusBadRequest)
		return
	}

	//get book group id
	bookGroupIdString := c.Query("bookGroupId")
	bookChapterIdString := c.Query("bookChapterId")

	if len(bookGroupIdString) == 0 && len(bookChapterIdString) == 0 {
		ReportError(c, errors.New("need book group or book chapter id"), "missing propertied", http.StatusBadRequest)
		return
	}

	extract := jwt.ExtractClaims(c)

	switch {
	case len(bookChapterIdString) != 0:
		// parse book chapter id
		bookChapterId64, err := strconv.ParseInt(bookChapterIdString, 10, 32)
		if err != nil {
			ReportError(c, err, "error parsing book chapter id", 500)
			return
		}
		bookChapterId := int32(bookChapterId64)

		// fetch a row using the id to check if the chapter exist
		peekChapterRow, err := queries.BookChapterById(ctx, bookChapterId)
		if err != nil {
			ReportError(c, err, "internal error", 500)
			return
		}

		//if it doesn't exist
		if peekChapterRow.ID == 0 {
			//if the book group id string is not empty
			if len(bookGroupIdString) > 0 {
				bookGroupId64, err := strconv.ParseInt(bookGroupIdString, 10, 32)
				if err != nil {
					ReportError(c, err, "error parsing book group id", 500)
					return
				}
				bookId := int32(bookGroupId64)

				peekBookRow, err := queries.BookGroupById(ctx, bookId)
				if peekBookRow.ID == 0 {
					ReportError(c, errors.New("invalid prerequisites"), "error", http.StatusBadRequest)
					return
				} else {
					err = queries.AddComment(ctx, db.AddCommentParams{
						UserID:      int32(extract[UserIdClaimKey].(float64)),
						BookGroupID: bookId,
						BookChapterID: sql.NullInt32{
							Valid: false,
						},
						Content: comment,
					})
					if err != nil {
						ReportError(c, err, "error creating comment", 500)
						return
					}
				}
			} else {
				ReportError(c, errors.New("invalid prerequisites"), "error", http.StatusBadRequest)
				return
			}
		} else { // if it exists
			err = queries.AddComment(ctx, db.AddCommentParams{
				UserID:      int32(extract[UserIdClaimKey].(float64)),
				BookGroupID: peekChapterRow.BookGroupID,
				BookChapterID: sql.NullInt32{
					Int32: bookChapterId,
					Valid: true,
				},
				Content: comment,
			})
			if err != nil {
				ReportError(c, err, "error inserting comment", 500)
				return
			}
		}

	case len(bookGroupIdString) != 0:
		bookGroupId64, err := strconv.ParseInt(bookGroupIdString, 10, 32)
		if err != nil {
			ReportError(c, err, "error parsing book group id", 500)
			return
		}
		bookId := int32(bookGroupId64)

		peekBookRow, err := queries.BookGroupById(ctx, bookId)
		if peekBookRow.ID == 0 {
			ReportError(c, errors.New("invalid prerequisites"), "error", http.StatusBadRequest)
			return
		} else {
			err = queries.AddComment(ctx, db.AddCommentParams{
				UserID:      int32(extract[UserIdClaimKey].(float64)),
				BookGroupID: bookId,
				BookChapterID: sql.NullInt32{
					Valid: false,
				},
				Content: comment,
			})
			if err != nil {
				ReportError(c, err, "error creating comment", 500)
				return
			}
		}
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
				resComment := Comment{
					Id:            comment.ID,
					Comment:       comment.Content,
					UserName:      comment.UserName.String,
					UserId:        comment.Userid,
					TimePosted:    comment.PostedTime.UnixMicro(),
					ChapterId:     chapterId,
					ChapterNumber: comment.ChapterNumber.Float64,
				}
				if comment.Avatarpath.Valid {
					resComment.UserAvatar = comment.Avatarpath.String
				}
				responseObj.Comments = append(responseObj.Comments, resComment)
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
				resComment := Comment{
					Id:            comment.ID,
					Comment:       comment.Content,
					UserName:      comment.UserName.String,
					UserId:        comment.Userid,
					TimePosted:    comment.PostedTime.UnixMicro(),
				}
				if comment.Avatarpath.Valid {
					resComment.UserAvatar = comment.Avatarpath.String
				}
				if comment.Chapterid.Valid {
					resComment.ChapterId = comment.Chapterid.Int32
				}
				if comment.ChapterNumber.Valid {
					resComment.ChapterNumber = comment.ChapterNumber.Float64
				}
				responseObj.Comments = append(responseObj.Comments, resComment)
			}
		} else {
			responseObj.Comments = make([]Comment, 0)
		}
	}
	c.JSON(200, responseObj)
}

func CountCommentInBookGroup(bookGroupId int32) (int32, error) {
	ctx := context.Background()
	queries := db.New(db.Pool())
	cnt, err := queries.CountCommentInBookGroup(ctx, bookGroupId)
	if err != nil {
		return 0, err
	}
	return int32(cnt), nil
}

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
}
