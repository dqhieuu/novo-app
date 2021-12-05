package server

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"github.com/dqhieuu/novo-app/db"
	"github.com/gin-gonic/gin"
	"net/http"
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

func CheckGenreExistById(id int32) (bool, error) {
	ctx := context.Background()
	queries := db.New(db.Pool())
	result, err := queries.CheckGenreExistById(ctx, id)
	if err != nil {
		return false, err
	}
	return result, nil
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
	ctx := context.Background()
	queries := db.New(db.Pool())
	err = queries.DeleteGenre(ctx, id)
	if err != nil {
		stringErr := fmt.Sprintf("Delete genre failed: %s", err)
		return errors.New(stringErr)
	}
	return nil
}

func ListAllGenresHandler(c *gin.Context) {
	ctx := context.Background()
	queries := db.New(db.Pool())
	genres, err := queries.GetAllGenre(ctx)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err})
		return
	}
	if genres == nil {
		genres = []db.GetAllGenreRow{}
	}
	c.JSON(http.StatusOK, genres)
}
