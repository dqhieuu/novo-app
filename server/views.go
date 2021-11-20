package server

import (
	"context"
	"errors"
	"github.com/dqhieuu/novo-app/db"
	"time"
)

type InsertViewParams struct{
	ChapterId int32
	ViewDate time.Time
}

func InsertView(params InsertViewParams) error {
	err := db.New(db.Pool()).UpsertViewByDate(context.Background(), db.UpsertViewByDateParams{
		BookChapterID: params.ChapterId,
		ViewDate:      params.ViewDate,
	})

	if err != nil {
		return errors.New("error inserting view: " + err.Error())
	}
	return nil
}

func ViewByWeek(chapterId int32) (int64, error) {
	totalViewByWeek, err := db.New(db.Pool()).GetViewByWeek(context.Background(), chapterId)
	if err != nil {
		return 0, errors.New("error getting views by week: " + err.Error())
	}

	//c.JSON(200, gin.H{
	//	"viewsByWeek": totalViewByWeek,
	//})
	return totalViewByWeek, nil
}

func ViewByMonth(chapterId int32) (int64, error) {
	totalViewByMonth, err := db.New(db.Pool()).GetViewByMonth(context.Background(), chapterId)
	if err != nil {
		return 0, errors.New("error getting views by month: " + err.Error())
	}

	//c.JSON(200, gin.H{
	//	"viewsByMonth": totalViewByMonth,
	//})
	return totalViewByMonth, nil
}

func ViewByYear(chapterId int32) (int64, error) {
	totalViewByYear, err := db.New(db.Pool()).GetViewByYear(context.Background(), chapterId)
	if err != nil {
		return 0, errors.New("error getting views by year: " + err.Error())
	}

	//c.JSON(200, gin.H{
	//	"viewsByWeek": totalViewByYear,
	//})
	return totalViewByYear, nil
}
