package server

import (
	"github.com/dqhieuu/novo-app/db"
	"github.com/gin-gonic/gin"
	"log"
	"strconv"
	"time"
)

func UpsertView(c *gin.Context) {
	chapterId, err := strconv.ParseInt(c.PostForm("chapterId"), 10, 32)
	if err != nil {
		log.Fatalf("Error parsing chapter ID: %s\n", err)
	}
	viewDate, err := time.Parse("2006-01-02 15:04:05", c.PostForm("viewDate"))
	if err != nil {
		log.Fatalf("Error parsing date: %s\n", err)
	}

	err = db.New(db.Pool()).UpsertViewByDate(c, db.UpsertViewByDateParams{
		BookChapterID: int32(chapterId),
		ViewDate:      viewDate,
	})

	if err != nil {
		log.Fatalf("Error upserting view: %s\n", err)
	}
}

func ViewByWeek(c *gin.Context) {
	chapterId, err := strconv.ParseInt(c.PostForm("chapterId"), 10, 32)
	if err != nil {
		log.Fatalf("Error parsing chapter ID: %s\n", err)
	}
	totalViewByWeek, err := db.New(db.Pool()).GetViewByWeek(c, int32(chapterId))
	if err != nil {
		log.Fatalf("Error getting views by week: %s\n", err)
	}

	c.JSON(200, gin.H{
		"viewsByWeek": totalViewByWeek,
	})
}

func ViewByMonth(c *gin.Context) {
	chapterId, err := strconv.ParseInt(c.PostForm("chapterId"), 10, 32)
	if err != nil {
		log.Fatalf("Error parsing chapter ID: %s\n", err)
	}
	totalViewByMonth, err := db.New(db.Pool()).GetViewByMonth(c, int32(chapterId))
	if err != nil {
		log.Fatalf("Error getting views by month: %s\n", err)
	}

	c.JSON(200, gin.H{
		"viewsByMonth": totalViewByMonth,
	})
}

func ViewByYear(c *gin.Context) {
	chapterId, err := strconv.ParseInt(c.PostForm("chapterId"), 10, 32)
	if err != nil {
		log.Fatalf("Error parsing chapter ID: %s\n", err)
	}
	totalViewByYear, err := db.New(db.Pool()).GetViewByYear(c, int32(chapterId))
	if err != nil {
		log.Fatalf("Error getting views by year: %s\n", err)
	}

	c.JSON(200, gin.H{
		"viewsByWeek": totalViewByYear,
	})
}
