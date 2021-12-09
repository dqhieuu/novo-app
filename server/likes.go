package server

import (
	"context"
	"errors"
	jwt "github.com/appleboy/gin-jwt/v2"
	"github.com/dqhieuu/novo-app/db"
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
)

const (
	Like = "like"
	DisLike = "dislike"
	Unlike = "unlike"
)

type UserLikeParams struct {
	UserId int32
	BookId int32
}

func LikeBookGroup(params UserLikeParams) error {
	err := db.New(db.Pool()).Likes(context.Background(), db.LikesParams{
		UserID:      params.UserId,
		BookGroupID: params.BookId,
	})

	if err != nil {
		return errors.New("error inserting likes: " + err.Error())
	}
	return nil
}

func DislikeBookGroup(params UserLikeParams) error {
	err := db.New(db.Pool()).DisLikes(context.Background(), db.DisLikesParams{
		UserID:      params.UserId,
		BookGroupID: params.BookId,
	})

	if err != nil {
		return errors.New("error inserting dislikes: " + err.Error())
	}
	return nil
}

func UnlikeBookGroup(params UserLikeParams) error {
	err := db.New(db.Pool()).Unlikes(context.Background(), db.UnlikesParams{
		UserID:      params.UserId,
		BookGroupID: params.BookId,
	})

	if err != nil {
		return errors.New("error inserting unlikes: " + err.Error())
	}
	return nil
}

func CountLikesInBookGroup(bookGroupId int32) (int64, error) {
	ctx := context.Background()
	queries := db.New(db.Pool())
	count, err := queries.GetLikes(ctx, bookGroupId)
	if err != nil {
		return 0, err
	}
	return count.(int64), nil
}

func LikeOperationHandler(c *gin.Context) {
	ctx := context.Background()
	queries := db.New(db.Pool())

	extract := jwt.ExtractClaims(c)
	userId := int32(extract[UserIdClaimKey].(float64))

	check, err := queries.CheckPermissionOnUserId(ctx, db.CheckPermissionOnUserIdParams{
		Module: LikeModule,
		Action: PostAction,
		ID:     userId,
	})
	if err != nil {
		ReportError(c, err, "error", 500)
		return
	}
	if !check {
		ReportError(c, errors.New("permission denied"), "error", 403)
		return
	}

	bookGroupIdString := c.Param("bookGroupId")
	operation := c.Param("operation")

	bookGroupId64, err := strconv.ParseInt(bookGroupIdString, 10, 32)
	if err != nil {
		ReportError(c, err, "error parsing book group id", 500)
		return
	}
	bookId := int32(bookGroupId64)

	peekBookRow, err := queries.BookGroupById(ctx, bookId)
	if err != nil {
		ReportError(c, err, "error getting book group", 500)
		return
	}
	if peekBookRow.ID == 0 {
		ReportError(c, errors.New("book group does not exist"), "error", http.StatusBadRequest)
		return
	} else {
		extract := jwt.ExtractClaims(c)
		userId := int32(extract[UserIdClaimKey].(float64))

		switch operation {
		case Like:
			alreadyLike, err := queries.CheckAlreadyLike(ctx, db.CheckAlreadyLikeParams{
				UserID:      userId,
				BookGroupID: bookId,
			})
			if err != nil {
				ReportError(c, err, "internal error", 500)
				return
			}
			if !alreadyLike {
				err := queries.Likes(ctx, db.LikesParams{
					UserID:      userId,
					BookGroupID: bookId,
				})
				if err != nil {
					ReportError(c, err, "error inserting likes", 500)
					return
				}
			} else {
				ReportError(c, errors.New("already like"), "error", http.StatusBadRequest)
				return
			}
		case DisLike:
			alreadyDisLike, err := queries.CheckAlreadyDislike(ctx, db.CheckAlreadyDislikeParams{
				UserID:      userId,
				BookGroupID: bookId,
			})
			if err != nil {
				ReportError(c, err, "internal error", 500)
				return
			}
			if !alreadyDisLike {
				err := queries.DisLikes(ctx, db.DisLikesParams{
					UserID:      userId,
					BookGroupID: bookId,
				})
				if err != nil {
					ReportError(c, err, "error inserting dislikes", 500)
					return
				}
			} else {
				ReportError(c, errors.New("already dislike"), "error", http.StatusBadRequest)
				return
			}
		case Unlike:
			alreadyLike, err := queries.CheckAlreadyLike(ctx, db.CheckAlreadyLikeParams{
				UserID:      userId,
				BookGroupID: bookId,
			})
			if err != nil {
				ReportError(c, err, "internal error", 500)
				return
			}
			if !alreadyLike {
				ReportError(c, errors.New("have not liked yet"), "error", http.StatusBadRequest)
				return
			} else {
				err = queries.Unlikes(ctx, db.UnlikesParams{
					UserID:      userId,
					BookGroupID: bookId,
				})
				if err != nil {
					ReportError(c, err, "error removing like", 500)
					return
				}
			}
		default:
			ReportError(c, errors.New("invalid operation"), "error", http.StatusBadRequest)
			return
		}

		c.JSON(200, gin.H{
			"message": "success",
		})
	}
}
