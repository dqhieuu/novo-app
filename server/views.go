package server

import (
	"github.com/dqhieuu/novo-app/db"
	"github.com/gin-gonic/gin"
	"log"
	"time"
)

type InsertViewParams struct{
	ChapterId int32
	ViewDate time.Time
}

func InsertView(c *gin.Context, params InsertViewParams) {
	err := db.New(db.Pool()).UpsertViewByDate(c, db.UpsertViewByDateParams{
		BookChapterID: params.ChapterId,
		ViewDate:      params.ViewDate,
	})

	if err != nil {
		log.Fatalf("Error upserting view: %s\n", err)
	}
}

func ViewByWeek(c *gin.Context, chapterId int32) {
	totalViewByWeek, err := db.New(db.Pool()).GetViewByWeek(c, chapterId)
	if err != nil {
		log.Fatalf("Error getting views by week: %s\n", err)
	}

	c.JSON(200, gin.H{
		"viewsByWeek": totalViewByWeek,
	})
}

func ViewByMonth(c *gin.Context, chapterId int32) {
	totalViewByMonth, err := db.New(db.Pool()).GetViewByMonth(c, chapterId)
	if err != nil {
		log.Fatalf("Error getting views by month: %s\n", err)
	}

	c.JSON(200, gin.H{
		"viewsByMonth": totalViewByMonth,
	})
}

func ViewByYear(c *gin.Context, chapterId int32) {
	totalViewByYear, err := db.New(db.Pool()).GetViewByYear(c, chapterId)
	if err != nil {
		log.Fatalf("Error getting views by year: %s\n", err)
	}

	c.JSON(200, gin.H{
		"viewsByWeek": totalViewByYear,
	})
}
