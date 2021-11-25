package server

import (
	"context"
	"errors"
	"fmt"
	"github.com/dqhieuu/novo-app/db"
)

func BookGroupGenre(bookGroupId, genreId int32) (bool, error) {
	ctx := context.Background()
	queries := db.New(db.Pool())
	result, err := queries.BookGroupGenre(ctx, db.BookGroupGenreParams{
		BookGroupID: bookGroupId, GenreID: genreId,
	})
	if err != nil {
		return false, err
	}
	return result, nil
}
func CreateBookGroupGenre(bookGroupId, genreId int32) (*db.BookGroupGenre, error) {
	ctx := context.Background()
	queries := db.New(db.Pool())

	bookGroupGenre, err := queries.InsertBookGroupGenre(ctx, db.InsertBookGroupGenreParams{
		BookGroupID: bookGroupId,
		GenreID:     genreId,
	})
	if err != nil {
		stringErr := fmt.Sprintf("Create book_group_genre failed: %s", err)
		return nil, errors.New(stringErr)
	}
	return &bookGroupGenre, nil
}

func DeleteBookGroupGenre(bookGroupId, genreId int32) error {
	ctx := context.Background()
	queries := db.New(db.Pool())
	err := queries.DeleteBookGroupGenre(ctx, db.DeleteBookGroupGenreParams{
		BookGroupID: bookGroupId,
		GenreID:     genreId,
	})
	if err != nil {
		stringErr := fmt.Sprintf("Delete book_group_genre failed: %s", err)
		return errors.New(stringErr)
	}
	return nil
}

func BookGroupsByGenre(genreId, page int32) ([]int32, error) {
	ctx := context.Background()
	queries := db.New(db.Pool())
	bookGroups, err := queries.BookGroupsByGenre(ctx, db.BookGroupsByGenreParams{
		GenreID: genreId,
		Offset:  (page - 1) * limitBookGroup,
		Limit:   limitBookGroup,
	})
	if err != nil {
		stringErr := fmt.Sprintf("Get bookGroups by genre failed: %s", err)
		return nil, errors.New(stringErr)
	}
	return bookGroups, err
}

func GenresByBookGroup(bookGroupId, page int32) ([]int32, error) {
	ctx := context.Background()
	queries := db.New(db.Pool())
	bookGroups, err := queries.GenresByBookGroup(ctx, db.GenresByBookGroupParams{
		BookGroupID: bookGroupId,
		Offset:      (page - 1) * limitGenres,
		Limit:       limitGenres,
	})
	if err != nil {
		stringErr := fmt.Sprintf("Get bookGroups by genre failed: %s", err)
		return nil, errors.New(stringErr)
	}
	return bookGroups, err
}

func DeleteGenresByBookGroup(bookGroupId int32) error {
	ctx := context.Background()
	queries := db.New(db.Pool())
	err := queries.DelBookGroupGenresByBookGroup(ctx, bookGroupId)
	if err != nil {
		stringErr := fmt.Sprintf("Delete book_group_genre by bookGroup failed: %s", err)
		return errors.New(stringErr)
	}
	return nil
}

func DeleteBookGroupsByGenre(genre int32) error {
	ctx := context.Background()
	queries := db.New(db.Pool())
	err := queries.DelBookGroupGenresByGenre(ctx, genre)
	if err != nil {
		stringErr := fmt.Sprintf("Delete book_group_genre by genre failed: %s", err)
		return errors.New(stringErr)
	}
	return nil
}
