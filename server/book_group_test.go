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
	createBookChapters()
	defer deleteBookChapters()
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
	createBookChapters()
	defer deleteBookChapters()
	ctx := context.Background()
	queries := db.New(db.Pool())
	title := "titleTest"
	description := "descTest"
	ownerId := users[r.Int31n(cntUser)].ID
	bookGroup1, err := CreateBookGroup(title, description, ownerId)
	if err != nil {
		t.Fatal(err)
	}
	defer func() {
		err = queries.DeleteBookGroup(ctx, bookGroup1.ID)
		if err != nil {
			t.Fatal(err)
		}
	}()

	bookGroup2, err := queries.BookGroupById(ctx, bookGroup1.ID)
	if err != nil {
		t.Fatal(err)
	}
	assert.Equal(t, *bookGroup1, bookGroup2, "Compare bookGroup")
}

func TestUpdateBookGroup(t *testing.T) {
	db.Init()
	defer db.Close()
	createBookChapters()
	defer deleteBookChapters()
	ctx := context.Background()
	queries := db.New(db.Pool())
	ownerId := users[r.Int31n(cntUser)].ID
	title := "titleTest"
	var description sql.NullString
	err := description.Scan("descTest")
	if err != nil {
		t.Fatal(err)
	}
	bookGroup1, err := queries.InsertBookGroup(ctx, db.InsertBookGroupParams{
		Title:       title,
		Description: description,
		Ownerid:     ownerId,
	})
	if err != nil {
		t.Fatal(err)
	}
	defer func() {
		err = queries.DeleteBookGroup(ctx, bookGroup1.ID)
		if err != nil {
			t.Fatal(err)
		}
	}()
	newTitle := "titleUpdate"
	newDesc := "descUpdate"
	newOwnerId := users[r.Int31n(cntUser)].ID
	err = UpdateBookGroup(bookGroup1.ID, newTitle, newDesc, newOwnerId)
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
}

func TestDeleteBookGroup(t *testing.T) {
	db.Init()
	defer db.Close()
	createBookChapters()
	defer deleteBookChapters()
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
}

func TestBookGroupsByTitle(t *testing.T) {
	db.Init()
	defer db.Close()
	createBookChapters()
	defer deleteBookChapters()
	titles := []string{"one", "two", "thee"}
	subTitle := titles[r.Intn(2)]
	newBookGroups, err := BookGroupsByTitle(subTitle, 1)
	if err != nil {
		t.Fatal(err)
	}
	for i := 0; i < len(bookGroups); i++ {
		if strings.Contains(bookGroups[i].Title, subTitle) == true {
			found := false
			for j := 0; j < len(newBookGroups); j++ {
				if bookGroups[i].ID == newBookGroups[j].ID {
					assert.Equal(t, bookGroups[i], newBookGroups[j])
					found = true
				}
			}
			if found != true {
				stringErr := fmt.Sprintf("Thiếu")
				t.Fatal(errors.New(stringErr))
			}
		}
	}
	for i := 0; i < len(newBookGroups); i++ {
		if strings.Contains(newBookGroups[i].Title, subTitle) != true {
			stringErr := fmt.Sprintf("%s not contains %s ", newBookGroups[i].Title, subTitle)
			t.Fatal(errors.New(stringErr))
		}
	}
}
