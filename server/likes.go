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
	err := db.New(db.Pool()).UpsertLikes(c, db.UpsertLikesParams{
		UserID:      params.UserId,
		BookGroupID: params.BookId,
	})

	if err != nil {
		log.Fatalf("Error upserting likes: %s\n", err)
	}
}

func InsertDisLikes(c *gin.Context, params LikesParams) {
	err := db.New(db.Pool()).DownsertLikes(c, db.DownsertLikesParams{
		UserID:      params.UserId,
		BookGroupID: params.BookId,
	})

	if err != nil {
		log.Fatalf("Error upserting likes: %s\n", err)
	}
}

func ReturnLikes(c *gin.Context, params LikesParams) {
	likes, err := db.New(db.Pool()).GetLikes(c, db.GetLikesParams{
		UserID:      params.UserId,
		BookGroupID: params.BookId,
	})

	if err != nil {
		log.Fatalf("Error upserting likes: %s\n", err)
	}

	c.JSON(200, gin.H{
		"likes": likes,
	})
}