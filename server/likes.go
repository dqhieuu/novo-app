package server

import (
	"github.com/dqhieuu/novo-app/db"
	"github.com/gin-gonic/gin"
	"log"
)

type LikesParams struct{
	UserId int32
	BookId int32
}
func InsertLikes(c *gin.Context, params LikesParams) {
	err := db.New(db.Pool()).Likes(c, db.LikesParams{
		UserID:      params.UserId,
		BookGroupID: params.BookId,
	})

	if err != nil {
		log.Fatalf("Error upserting likes: %s\n", err)
	}
}

func InsertDisLikes(c *gin.Context, params LikesParams) {
	err := db.New(db.Pool()).DisLikes(c, db.DisLikesParams{
		UserID:      params.UserId,
		BookGroupID: params.BookId,
	})

	if err != nil {
		log.Fatalf("Error upserting likes: %s\n", err)
	}
}

func InsertUnLikes(c *gin.Context, params LikesParams) {
	err := db.New(db.Pool()).Unlikes(c, db.UnlikesParams{
		UserID:      params.UserId,
		BookGroupID: params.BookId,
	})

	if err != nil {
		log.Fatalf("Error upserting likes: %s\n", err)
	}
}

func ReturnLikes(c *gin.Context, bookId int32) {
	likes, err := db.New(db.Pool()).GetLikes(c, bookId)

	if err != nil {
		log.Fatalf("Error upserting likes: %s\n", err)
	}

	c.JSON(200, gin.H{
		"likes": likes,
	})
}