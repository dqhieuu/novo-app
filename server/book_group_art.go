package server

import (
	"context"
	"errors"
	"fmt"
	"github.com/dqhieuu/novo-app/db"
)

func CreateBookGroupArt(bookGroupId, imageId int32) (*db.BookGroupArt, error) {
	ctx := context.Background()
	queries := db.New(db.Pool())

	bookGroupArt, err := queries.InsertBookGroupArt(ctx, db.InsertBookGroupArtParams{
		BookGroupID: bookGroupId,
		ImageID:     imageId,
	})
	if err != nil {
		stringErr := fmt.Sprintf("Create book_group_art failed: %s", err)
		return nil, errors.New(stringErr)
	}
	return &bookGroupArt, nil
}

func DeleteCoverOfBookGroup(bookGroupId int32) error {
	ctx := context.Background()
	queries := db.New(db.Pool())
	err := queries.DeleteCoverOfBookGroup(ctx, bookGroupId)
	if err != nil {
		stringErr := fmt.Sprintf("Delete cover art book group failed: %s", err)
		return errors.New(stringErr)
	}
	return nil
}
