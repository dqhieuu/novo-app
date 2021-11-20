package server

import (
	"github.com/dqhieuu/novo-app/db"
	"github.com/gin-gonic/gin"
	"log"
	"strconv"
)

func UpsertLikes(c *gin.Context) {
	userId, _ := strconv.ParseInt(c.PostForm("userId"), 10, 32)
	bookId, _ := strconv.ParseInt(c.PostForm("bookId"), 10, 32)

	err := db.New(db.Pool()).UpsertLikes(c, db.UpsertLikesParams{
		UserID:      int32(userId),
		BookGroupID: int32(bookId),
	})

	if err != nil {
		log.Fatalf("Error upserting likes: %s\n", err)
	}
}

func ReturnLikes(c *gin.Context) {
	userId, _ := strconv.ParseInt(c.PostForm("userId"), 10, 32)
	bookId, _ := strconv.ParseInt(c.PostForm("bookId"), 10, 32)

	likes, err := db.New(db.Pool()).GetLikes(c, db.GetLikesParams{
		UserID:      int32(userId),
		BookGroupID: int32(bookId),
	})

	if err != nil {
		log.Fatalf("Error upserting likes: %s\n", err)
	}

	c.JSON(200, gin.H{
		"likes": likes,
	})
}