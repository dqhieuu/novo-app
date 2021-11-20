package server

import (
	"github.com/dqhieuu/novo-app/db"
	"github.com/gin-gonic/gin"
	"log"
	"strconv"
)

func UpsertLikes(c *gin.Context) {
	userId, err := strconv.ParseInt(c.PostForm("userId"), 10, 32)
	if err != nil {
		log.Fatalf("Error parsing user ID: %s\n", err)
	}
	bookId, err := strconv.ParseInt(c.PostForm("bookId"), 10, 32)
	if err != nil {
		log.Fatalf("Error parsing book group ID: %s\n", err)
	}
	err = db.New(db.Pool()).UpsertLikes(c, db.UpsertLikesParams{
		UserID:      int32(userId),
		BookGroupID: int32(bookId),
	})

	if err != nil {
		log.Fatalf("Error upserting likes: %s\n", err)
	}
}

func ReturnLikes(c *gin.Context) {
	userId, err := strconv.ParseInt(c.PostForm("userId"), 10, 32)
	if err != nil {
		log.Fatalf("Error parsing user ID: %s\n", err)
	}
	bookId, err := strconv.ParseInt(c.PostForm("bookId"), 10, 32)
	if err != nil {
		log.Fatalf("Error parsing book group ID: %s\n", err)
	}

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