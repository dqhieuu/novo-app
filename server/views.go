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