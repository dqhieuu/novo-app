package server

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"github.com/dqhieuu/novo-app/db"
	"github.com/stretchr/testify/assert"
	"strings"
	"testing"
)

func TestBookGroupById(t *testing.T) {
	db.Init()
	defer db.Close()
	createData()
	defer removeData()

	intRandom := r.Intn(len(bookGroups))
	bookGroup1 := bookGroups[intRandom]
	bookGroup2, err := BookGroupById(bookGroup1.ID)
	if err != nil {
		t.Fatal(err)
	}
	assert.Equal(t, bookGroup1, bookGroup2, "Compare bookGroup")
}

func TestCreateBookGroup(t *testing.T) {
	db.Init()
	defer db.Close()
	createData()
	defer removeData()

	ctx := context.Background()
	queries := db.New(db.Pool())
	title := "titleTest"
	description := "descTest"
	ownerId := users[r.Int31n(cntUser)].ID
	var genreIds []int32
	length := r.Intn(len(genres))
	for i := 0; i < length && len(genreIds) <= limitBookGroup; i++ { // xét page 1
		genreIds = append(genreIds, genres[i].ID)
	}

	bookGroup1, err := CreateBookGroup(title, description, ownerId, genreIds, []int32{})
	if err != nil {
		t.Fatal(err)
	}

	bookGroup2, err := queries.BookGroupById(ctx, bookGroup1.ID)
	if err != nil {
		t.Fatal(err)
	}
	assert.Equal(t, *bookGroup1, bookGroup2, "Compare bookGroup")
	tmp, err := GenresByBookGroup(bookGroup2.ID, 1)
	if err != nil {
		t.Fatal(err)
	}

	assert.Equal(t, len(tmp), len(genreIds))
	for i := 0; i < len(tmp); i++ {
		assert.Equal(t, tmp[i], genreIds[i])
	}
	err = DeleteBookGroup(bookGroup1.ID)
	if err != nil {
		t.Fatal(err)
	}
}

func TestUpdateBookGroup(t *testing.T) {
	db.Init()
	defer db.Close()
	createData()
	defer removeData()

	ctx := context.Background()
	queries := db.New(db.Pool())

	intRand := r.Intn(len(bookGroups))
	bookGroup1 := bookGroups[intRand]

	newTitle := "titleUpdate"
	newDesc := "descUpdate"
	newOwnerId := users[r.Int31n(cntUser)].ID

	length := r.Intn(len(genres))
	var genreIds []int32
	for i := 0; i < length && len(genreIds) <= limitGenres; i++ {
		if r.Intn(1) == 1 {
			genreIds = append(genreIds, genres[i].ID)
		}
	}

	err := UpdateBookGroup(bookGroup1.ID, newTitle, newDesc, newOwnerId, genreIds, []int32{})
	bookGroup2, err := queries.BookGroupById(ctx, bookGroup1.ID)
	if err != nil {
		t.Fatal(err)
	}
	assert.Equal(t, bookGroup2.Title, newTitle, "Compare title")
	var tmp sql.NullString
	err = tmp.Scan(newDesc)
	if err != nil {
		t.Fatal(err)
	}
	assert.Equal(t, bookGroup2.Description, tmp, "Compare description")
	assert.Equal(t, bookGroup2.Ownerid, newOwnerId, "Compare ownerID")

	genreIds2, err := GenresByBookGroup(bookGroup1.ID, 1)
	if err != nil {
		t.Fatal(err)
	}
	assert.Equal(t, len(genreIds), len(genreIds2))
	for i := 0; i < len(genreIds); i++ {
		assert.Equal(t, genreIds[i], genreIds2[i])
	}
}

func TestDeleteBookGroup(t *testing.T) {
	db.Init()
	defer db.Close()
	createData()
	defer removeData()

	intRandom := r.Intn(len(bookGroups))
	bookGroup1 := bookGroups[intRandom]
	err := DeleteBookGroup(bookGroup1.ID)
	if err != nil {
		t.Fatal(err)
	}
	bookGroup2, err := BookGroupById(bookGroup1.ID)
	if bookGroup2 != nil {
		stringErr := fmt.Sprintf("Book group have not been deleted")
		t.Fatal(errors.New(stringErr))
	}

	genreIds, err := GenresByBookGroup(bookGroup1.ID, 1)
	if err != nil {
		t.Fatal(err)
	}
	if len(genreIds) > 0 {
		stringErr := fmt.Sprintf("Bảng book_group_genres không cập nhật theo")
		t.Fatal(stringErr)
	}

	bookChapterTest, err := BookChaptersByBookGroupId(bookGroup1.ID, 1)
	if len(bookChapterTest) > 0 {
		stringErr := fmt.Sprintf("Bảng book chapter không cập nhật theo")
		t.Fatal(stringErr)
	}
}

func TestBookGroupsByTitle(t *testing.T) {
	db.Init()
	defer db.Close()
	createData()
	defer removeData()

	titles := []string{"one", "two", "thee"}
	intRand := r.Intn(len(titles))
	subTitle := titles[intRand]
	tmp1, err := BookGroupsByTitle(subTitle, 1)
	if err != nil {
		t.Fatal(err)
	}
	var tmp2 []*db.BookGroup
	for i := 0; i < len(bookGroups) && len(tmp2) <= limitBookGroup; i++ {
		if strings.Contains(bookGroups[i].Title, subTitle) == true {
			tmp2 = append(tmp2, bookGroups[i])
		}
	}
	assert.Equal(t, len(tmp1), len(tmp2))
	for i := 0; i < len(tmp1); i++ {
		assert.Equal(t, tmp1[i], tmp2[i])
	}
}
