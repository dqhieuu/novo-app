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

func TestBookAuthors(t *testing.T) {
	db.Init()
	defer db.Close()
	createData()
	defer removeData()
	bookAuthorsTest, err := BookAuthors(1)
	if err != nil {
		t.Fatal(err)
	}
	for i := 0; i < len(bookAuthorsTest); i++ {
		assert.Equal(t, bookAuthorsTest[i], bookAuthors[i])
	}
}
func TestBookAuthorById(t *testing.T) {
	db.Init()
	defer db.Close()
	createData()
	defer removeData()
	intRandom := r.Intn(len(bookAuthors))
	bookAuthor1 := bookAuthors[intRandom]
	bookAuthor2, err := BookAuthorById(bookAuthor1.ID)
	if err != nil {
		t.Fatal(err)
	}
	assert.Equal(t, bookAuthor1, bookAuthor2)
}

func TestCreateBookAuthor(t *testing.T) {
	db.Init()
	defer db.Close()
	createData()
	defer removeData()
	name := "nameTest"
	description := "descTest"
	imageID := sql.NullInt32{}.Int32
	bookAuthorTest, err := CreateBookAuthor(name, description, imageID)
	if err != nil {
		t.Fatal(err)
	}
	assert.Equal(t, bookAuthorTest.Name, name)
	assert.Equal(t, bookAuthorTest.Description.String, description)
	assert.Equal(t, bookAuthorTest.AvatarImageID.Int32, imageID)
	ctx := context.Background()
	queries := db.New(db.Pool())
	err = queries.DeleteBookAuthor(ctx, bookAuthorTest.ID)
	if err != nil {
		t.Fatal(err)
	}
}

func TestDeleteBookAuthor(t *testing.T) {
	db.Init()
	defer db.Close()
	createData()
	defer removeData()
	ctx := context.Background()
	queries := db.New(db.Pool())
	intRand := r.Intn(len(bookAuthors))
	bookAuthorTest := bookAuthors[intRand]

	err := DeleteBookAuthor(bookAuthorTest.ID) // xóa
	if err != nil {
		t.Fatal(err)
	}

	bookAuthorCheck, _ := queries.BookAuthorById(ctx, bookAuthorTest.ID) // kiểm tra book_author đã bị xóa chưa
	if bookAuthorCheck != (db.BookAuthor{}) {
		stringErr := fmt.Sprintf("Gener have not been deleted")
		t.Fatal(errors.New(stringErr))
	}

	// kiểm tra bảng book_group_authors đã cập nhật sau khi xóa ở bảng book_authors chưa
	tmp2, err := BookGroupsByAuthor(bookAuthorTest.ID, 1)
	if err != nil {
		t.Fatal(err)
	}
	if len(tmp2) > 0 {
		stringErr := fmt.Sprintf("BookGroupGener have not been deleted")
		t.Fatal(errors.New(stringErr))
	}
}

func TestUpdateBookAuthor(t *testing.T) {
	db.Init()
	defer db.Close()
	createData()
	defer removeData()
	ctx := context.Background()
	queries := db.New(db.Pool())
	intRand := r.Intn(len(bookAuthors))
	id := bookAuthors[intRand].ID
	name := "nameTest"
	description := "descTest"
	avatarImageID := int32(0)
	err := UpdateBookAuthor(id, name, description, avatarImageID)
	if err != nil {
		t.Fatal(err)
	}
	bookAuthorTest, err := queries.BookAuthorById(ctx, id)
	if err != nil {
		t.Fatal(err)
	}
	assert.Equal(t, bookAuthorTest.Name, name)
	assert.Equal(t, bookAuthorTest.Description.String, description)
	assert.Equal(t, bookAuthorTest.AvatarImageID.Int32, avatarImageID)
	err = queries.UpdateBookAuthor(ctx, db.UpdateBookAuthorParams{
		ID:            bookAuthors[intRand].ID,
		Name:          bookAuthors[intRand].Name,
		Description:   bookAuthors[intRand].Description,
		AvatarImageID: bookAuthors[intRand].AvatarImageID,
	})
	if err != nil {
		t.Fatal(err)
	}

}
