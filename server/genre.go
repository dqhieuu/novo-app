package server

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"github.com/dqhieuu/novo-app/db"
)

const limitGenres = 50

func GenreById(id int32) (*db.Genre, error) {
	ctx := context.Background()
	queries := db.New(db.Pool())
	genre, err := queries.GenreById(ctx, id)

	if err != nil {
		stringErr := fmt.Sprintf("Get genre by id failed: %s", err)
		return nil, errors.New(stringErr)
	}
	return &genre, err
}

func Genres(page int32) ([]*db.Genre, error) {
	ctx := context.Background()
	queries := db.New(db.Pool())
	genres, err := queries.Genres(ctx, db.GenresParams{
		Offset: (page - 1) * limitGenres,
		Limit:  limitGenres,
	})
	if err != nil {
		stringErr := fmt.Sprintf("Get genres list failed: %s", err)
		return nil, errors.New(stringErr)
	}
	var outData []*db.Genre
	for i := 0; i < len(genres); i++ {
		outData = append(outData, &genres[i])
	}
	return outData, err
}

func UpdateGenre(id int32, name, description string, imageID int32) error {

	ctx := context.Background()
	queries := db.New(db.Pool())

	var descriptionSql sql.NullString
	err := descriptionSql.Scan(description)
	if err != nil {
		stringErr := fmt.Sprintf("Update genre failed: %s", err)
		return errors.New(stringErr)
	}

	var imageIdSql = sql.NullInt32{
		Int32: imageID,
		Valid: imageID > 0,
	}

	err = queries.UpdateGenre(ctx, db.UpdateGenreParams{
		ID:          id,
		Name:        name,
		Description: descriptionSql,
		ImageID:     imageIdSql,
	})
	if err != nil {
		stringErr := fmt.Sprintf("Update genre failed: %s", err)
		return errors.New(stringErr)
	}
	return nil
}

func CreateGenre(name, description string, imageID int32) (*db.Genre, error) {

	ctx := context.Background()
	queries := db.New(db.Pool())

	var descriptionSql sql.NullString
	err := descriptionSql.Scan(description)
	if err != nil {
		stringErr := fmt.Sprintf("Update genre failed: %s", err)
		return nil, errors.New(stringErr)
	}

	var imageIdSql = sql.NullInt32{
		Int32: imageID,
		Valid: imageID > 0,
	}

	genre, err := queries.InsertGenre(ctx, db.InsertGenreParams{
		Name:        name,
		Description: descriptionSql,
		ImageID:     imageIdSql,
	})
	if err != nil {
		stringErr := fmt.Sprintf("Create genre failed: %s", err)
		return nil, errors.New(stringErr)
	}
	return &genre, nil
}

func DeleteGenre(id int32) error {
	var err error
	err = DeleteBookGroupsByGenre(id)
	if err != nil {
		stringErr := fmt.Sprintf("Delete genre failed: %s", err)
		return errors.New(stringErr)
	}
	ctx := context.Background()
	queries := db.New(db.Pool())
	err = queries.DeleteGenre(ctx, id)
	if err != nil {
		stringErr := fmt.Sprintf("Delete genre failed: %s", err)
		return errors.New(stringErr)
	}
	return nil
}
