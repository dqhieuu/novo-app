package server

import (
	"context"
	"errors"
	"fmt"
	"github.com/dqhieuu/novo-app/db"
)

func BookGroupAuthor(bookGroupId, bookAuthorId int32) (bool, error) {
	ctx := context.Background()
	queries := db.New(db.Pool())
	result, err := queries.BookGroupAuthor(ctx, db.BookGroupAuthorParams{
		BookGroupID: bookGroupId, BookAuthorID: bookAuthorId,
	})
	if err != nil {
		return false, err
	}
	return result, nil
}
func CreateBookGroupAuthor(bookGroupId, bookAuthorId int32) (*db.BookGroupAuthor, error) {
	ctx := context.Background()
	queries := db.New(db.Pool())

	bookGroupAuthor, err := queries.InsertBookGroupAuthor(ctx, db.InsertBookGroupAuthorParams{
		BookGroupID:  bookGroupId,
		BookAuthorID: bookAuthorId,
	})
	if err != nil {
		stringErr := fmt.Sprintf("Create book_group_author failed: %s", err)
		return nil, errors.New(stringErr)
	}
	return &bookGroupAuthor, nil
}

func DeleteBookGroupAuthor(bookGroupId, bookAuthorId int32) error {
	ctx := context.Background()
	queries := db.New(db.Pool())
	err := queries.DeleteBookGroupAuthor(ctx, db.DeleteBookGroupAuthorParams{
		BookGroupID:  bookGroupId,
		BookAuthorID: bookAuthorId,
	})
	if err != nil {
		stringErr := fmt.Sprintf("Delete book_group_author failed: %s", err)
		return errors.New(stringErr)
	}
	return nil
}

func BookGroupsByAuthor(bookAuthorId, page int32) ([]int32, error) {
	ctx := context.Background()
	queries := db.New(db.Pool())
	bookGroups, err := queries.BookGroupsByAuthor(ctx, db.BookGroupsByAuthorParams{
		BookAuthorID: bookAuthorId,
		Offset:       (page - 1) * limitBookGroup,
		Limit:        limitBookGroup,
	})
	if err != nil {
		stringErr := fmt.Sprintf("Get bookGroups by author failed: %s", err)
		return nil, errors.New(stringErr)
	}
	return bookGroups, err
}

func AuthorsByBookGroup(bookGroupId, page int32) ([]int32, error) {
	ctx := context.Background()
	queries := db.New(db.Pool())
	bookGroups, err := queries.AuthorsByBookGroup(ctx, db.AuthorsByBookGroupParams{
		BookGroupID: bookGroupId,
		Offset:      (page - 1) * limitBookAuthors,
		Limit:       limitBookAuthors,
	})
	if err != nil {
		stringErr := fmt.Sprintf("Get authors by bookGroup failed: %s", err)
		return nil, errors.New(stringErr)
	}
	return bookGroups, err
}

func DeleteAuthorsByBookGroup(bookGroupId int32) error {
	ctx := context.Background()
	queries := db.New(db.Pool())
	err := queries.DelBookGroupAuthorsByBookGroup(ctx, bookGroupId)
	if err != nil {
		stringErr := fmt.Sprintf("Delete bookGroupAuthor by bookGroup failed: %s", err)
		return errors.New(stringErr)
	}
	return nil
}

func DeleteBookGroupsByBookAuthor(genre int32) error {
	ctx := context.Background()
	queries := db.New(db.Pool())
	err := queries.DelBookGroupAuthorsByAuthor(ctx, genre)
	if err != nil {
		stringErr := fmt.Sprintf("Delete bookGroupAuthor by author failed: %s", err)
		return errors.New(stringErr)
	}
	return nil
}
