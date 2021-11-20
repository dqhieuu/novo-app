package server

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"github.com/dqhieuu/novo-app/db"
	"github.com/stretchr/testify/assert"
	"math/rand"
	"strconv"
	"strings"
	"testing"
	"time"
)

var users []*db.User
var r *rand.Rand
var cnt_role int32 = 10
var cnt_user int32 = 10

func createUserAndRole(t *testing.T) []*db.User {
	var users []*db.User
	ctx := context.Background()
	queries := db.New(db.Pool())
	for i := 0; i < int(cnt_user); i++ {
		stringI := strconv.Itoa(i)
		username := "testUser" + stringI
		password := "secretPw" + stringI
		email := "user" + stringI + "@atest.com"
		testRole := "Test" + stringI
		_, err := queries.InsertNewRole(ctx, db.InsertNewRoleParams{
			Name: testRole,
		})

		user, err := CreateAccount(username, password, email, testRole)
		if err != nil {
			t.Fatal(err)
		}
		users = append(users, user)
		if err != nil {
			t.Fatal(err)
		}
	}
	return users
}
func delUserAndRole(t *testing.T) {
	ctx := context.Background()
	queries := db.New(db.Pool())
	for i := 0; i < 10; i++ {
		stringI := strconv.Itoa(i)
		username := "testUser" + stringI
		testRole := "Test" + stringI
		defer func() {
			err := queries.DeleteRole(ctx, testRole)
			if err != nil {
				t.Fatal(err)
			}
		}()

		defer func() {
			err := DeleteAccount(username)
			if err != nil {
				t.Fatal(err)
			}
		}()
	}

}

func TestBookGroup(t *testing.T) {
	s := rand.NewSource(time.Now().UnixNano())
	r = rand.New(s)
	db.Init()
	defer db.Pool().Close()
	users = createUserAndRole(t)
	defer delUserAndRole(t)
	testBookGroupById(t)
	testCreateBookGroup(t)
	testUpdateBookGroup(t)
	testDeleteBookGroup(t)
	testBookGroupsByTitle(t)
}

func testBookGroupById(t *testing.T) {
	ctx := context.Background()
	queries := db.New(db.Pool())
	title := "titleTest"
	description := "descTest"
	ownerId := users[r.Int31n(cnt_user)].ID
	bookGroup1, err := queries.InsertBookGroup(ctx, db.InsertBookGroupParams{
		Title:       title,
		Description: sql.NullString{String: description, Valid: description != ""},
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

	bookGroup2, err := BookGroupById(bookGroup1.ID)
	if err != nil {
		t.Fatal(err)
	}
	assert.Equal(t, bookGroup1, *bookGroup2, "Compare bookGroup")
}

func testCreateBookGroup(t *testing.T) {
	ctx := context.Background()
	queries := db.New(db.Pool())
	title := "titleTest"
	description := "descTest"
	ownerId := users[r.Int31n(cnt_user)].ID
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

func testUpdateBookGroup(t *testing.T) {
	ctx := context.Background()
	queries := db.New(db.Pool())
	ownerId := users[r.Int31n(cnt_user)].ID
	title := "titleTest"
	description := "descTest"
	bookGroup1, err := queries.InsertBookGroup(ctx, db.InsertBookGroupParams{
		Title: title,
		Description: sql.NullString{
			String: description,
			Valid:  description != "",
		},
		Ownerid: ownerId,
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
	newOwnerId := users[r.Int31n(cnt_user)].ID
	err = UpdateBookGroup(bookGroup1.ID, newTitle, newDesc, newOwnerId)
	bookGroup2, err := queries.BookGroupById(ctx, bookGroup1.ID)
	if err != nil {
		t.Fatal(err)
	}
	assert.Equal(t, bookGroup2.Title, newTitle, "Compare title")
	assert.Equal(t, bookGroup2.Description, sql.NullString{
		String: newDesc,
		Valid:  newDesc != "",
	}, "Compare description")
	assert.Equal(t, bookGroup2.Ownerid, newOwnerId, "Compare ownerID")
}

func testDeleteBookGroup(t *testing.T) {
	ctx := context.Background()
	queries := db.New(db.Pool())
	ownerId := users[r.Int31n(cnt_user)].ID
	title := "titleTest"
	description := "descTest"
	bookGroup1, err := queries.InsertBookGroup(ctx, db.InsertBookGroupParams{
		Title: title,
		Description: sql.NullString{
			String: description,
			Valid:  description != "",
		},
		Ownerid: ownerId,
	})
	if err != nil {
		t.Fatal(err)
	}
	err = DeleteBookGroup(bookGroup1.ID)
	if err != nil {
		t.Fatal(err)
	}
	bookGroup2, err := queries.BookGroupById(ctx, bookGroup1.ID)
	if bookGroup2 != (db.BookGroup{}) {
		stringErr := fmt.Sprintf("Delete failed, book group still exist")
		t.Fatal(errors.New(stringErr))
	}
}

func testBookGroupsByTitle(t *testing.T) {
	ctx := context.Background()
	queries := db.New(db.Pool())
	titles := []string{"one", "two", "thee"}
	for i := 0; i < 10; i++ {
		title := titles[r.Intn(2)] + strconv.Itoa(r.Intn(10))
		description := "description" + strconv.Itoa(r.Intn(10))
		ownerId := users[r.Int31n(cnt_user)].ID
		bookGroup1, err := queries.InsertBookGroup(ctx, db.InsertBookGroupParams{
			Title:       title,
			Description: sql.NullString{String: description, Valid: description != ""},
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
	}
	subTitle := titles[r.Intn(2)]
	bookGroups, err := BookGroupsByTitle(subTitle, 1)
	if err != nil {
		t.Fatal(err)
	}
	for i := 0; i < len(bookGroups); i++ {
		if strings.Contains(bookGroups[i].Title, subTitle) != true {
			stringErr := fmt.Sprintf("%s not contains %s ", bookGroups[i].Title, subTitle)
			t.Fatal(errors.New(stringErr))
		}
	}
}
