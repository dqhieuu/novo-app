package server

import (
	"context"
	"errors"
	"github.com/dqhieuu/novo-app/db"
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

//func ReturnLikes(bookId int32) (int64, error) {
//	likes, err := db.New(db.Pool()).GetLikes(context.Background(), bookId)
//
//	if err != nil {
//		return 0, errors.New("error getting total likes: " + err.Error())
//	}
//
//	//c.JSON(200, gin.H{
//	//	"likes": likes,
//	//})
//	return likes, nil
//}
