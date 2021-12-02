package server

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"github.com/dqhieuu/novo-app/db"
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestGenreById(t *testing.T) {
	db.Init()
	defer db.Close()
	createData()
	defer removeData()
	intRandom := r.Intn(len(genres))
	genre1 := genres[intRandom]
	genre2, err := GenreById(genre1.ID)
	if err != nil {
		t.Fatal(err)
	}
	assert.Equal(t, genre1, genre2)
}

func TestCreateGenre(t *testing.T) {
	db.Init()
	defer db.Close()
	createData()
	defer removeData()
	name := "nameTest"
	description := "descTest"
	imageID := sql.NullInt32{}.Int32
	genreTest, err := CreateGenre(name, description, imageID)
	if err != nil {
		t.Fatal(err)
	}
	assert.Equal(t, genreTest.Name, name)
	assert.Equal(t, genreTest.Description.String, description)
	assert.Equal(t, genreTest.ImageID.Int32, imageID)
	ctx := context.Background()
	queries := db.New(db.Pool())
	err = queries.DeleteGenre(ctx, genreTest.ID)
	if err != nil {
		t.Fatal(err)
	}
}

func TestDeleteGenre(t *testing.T) {
	db.Init()
	defer db.Close()
	createData()
	defer removeData()
	ctx := context.Background()
	queries := db.New(db.Pool())
	intRand := r.Intn(len(genres))
	genreTest := genres[intRand]

	err := DeleteGenre(genreTest.ID) // xóa
	if err != nil {
		t.Fatal(err)
	}

	genreCheck, _ := queries.GenreById(ctx, genreTest.ID) // kiểm tra genre đã bị xóa chưa
	if genreCheck != (db.Genre{}) {
		stringErr := fmt.Sprintf("Gener have not been deleted")
		t.Fatal(errors.New(stringErr))
	}

	// kiểm tra bảng book_group_genres đã cập nhật sau khi xóa ở bảng genres chưa
	tmp2, err := BookGroupsByGenre(genreTest.ID, 1)
	if err != nil {
		t.Fatal(err)
	}
	if len(*tmp2) > 0 {
		stringErr := fmt.Sprintf("BookGroupGener have not been deleted")
		t.Fatal(errors.New(stringErr))
	}
}

func TestUpdateGenre(t *testing.T) {
	db.Init()
	defer db.Close()
	createData()
	defer removeData()
	ctx := context.Background()
	queries := db.New(db.Pool())
	intRand := r.Intn(len(genres))
	id := genres[intRand].ID
	name := "nameTest"
	description := "descTest"
	imageID := int32(0)
	err := UpdateGenre(id, name, description, imageID)
	if err != nil {
		t.Fatal(err)
	}
	genreTest, err := queries.GenreById(ctx, id)
	if err != nil {
		t.Fatal(err)
	}
	assert.Equal(t, genreTest.Name, name)
	assert.Equal(t, genreTest.Description.String, description)
	assert.Equal(t, genreTest.ImageID.Int32, imageID)
	err = queries.UpdateGenre(ctx, db.UpdateGenreParams{
		ID:          genres[intRand].ID,
		Name:        genres[intRand].Name,
		Description: genres[intRand].Description,
		ImageID:     genres[intRand].ImageID,
	})
	if err != nil {
		t.Fatal(err)
	}

}
