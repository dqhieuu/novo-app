package server

import (
	"context"
	"errors"
	"github.com/dqhieuu/novo-app/db"
	"time"
)

type InsertViewParams struct {
	ChapterId int32
	ViewDate  time.Time
}

func InsertView(chapterId int32) error {
	err := db.New(db.Pool()).UpsertViewByDate(context.Background(), chapterId)

	if err != nil {
		return errors.New("error inserting view: " + err.Error())
	}
	return nil
}

func GetViewInBookGroup(bookGroupId int32) (int64, error) {
	ctx := context.Background()
	queries := db.New(db.Pool())
	count, err := queries.GetBookGroupView(ctx, bookGroupId)
	if err != nil {
		return 0, err
	}
	return count.(int64), nil
}
