package server

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"github.com/dqhieuu/novo-app/db"
	"github.com/jackc/pgtype"
	"github.com/stretchr/testify/assert"
	"math/rand"
	"strconv"
	"testing"
	"time"
)

var bookChapters []*db.BookChapter
var types = []string{"image", "hypertext"}
var users []*db.User

const cntBookChapter int32 = 10

var r *rand.Rand
var cntRole int32 = 3
var cntUser int32 = 10
var bookGroups []*db.BookGroup

const cntBookGroup int32 = 10

var roleNames = []string{"user", "moderator", "admin"}

func createUsers() {
	users = []*db.User{}
	s := rand.NewSource(time.Now().UnixNano())
	r = rand.New(s)
	ctx := context.Background()
	queries := db.New(db.Pool())
	var username, password sql.NullString
	for i := 0; i < int(cntUser); i++ {
		stringI := strconv.Itoa(i)
		err := username.Scan("testUser" + stringI)
		if err != nil {
			fmt.Println(err)
		}
		err = password.Scan("secretPw" + stringI)
		if err != nil {
			fmt.Println(err)
		}
		email := "user" + stringI + "@atest.com"
		testRole := roleNames[r.Int31n(cntRole)]
		user, err := queries.InsertUser(ctx, db.InsertUserParams{
			UserName: username,
			Password: password,
			Email:    email,
			RoleName: testRole,
		})
		if err != nil {
			fmt.Println(err)
		}
		users = append(users, &user)
	}
	//fmt.Println("Create data for users table", len(users))
}
func deleteUsers() {
	ctx := context.Background()
	queries := db.New(db.Pool())
	for i := 0; i < len(users); i++ {
		err := queries.DeleteUser(ctx, users[i].UserName)
		if err != nil {
			fmt.Println(err)
		}
	}
	users = []*db.User{}
	//fmt.Println("Delete data in users table done")
}

func createBookGroups() {
	createUsers()
	bookGroups = []*db.BookGroup{}
	ctx := context.Background()
	queries := db.New(db.Pool())
	var description sql.NullString
	var ownerId int32
	titles := []string{"one", "two", "thee"}
	var title string
	for i := 0; i < int(cntBookGroup); i++ {
		stringI := strconv.Itoa(i)
		title = titles[i%len(titles)] + strconv.Itoa(r.Intn(10))
		err := description.Scan("description" + stringI)
		if err != nil {
			fmt.Println(err)
		}
		ownerId = users[r.Intn(len(users))].ID
		bookGroup, err := queries.InsertBookGroup(ctx, db.InsertBookGroupParams{
			Title: title, Description: description, Ownerid: ownerId,
		})
		if err != nil {
			fmt.Println(err)
		}
		bookGroups = append(bookGroups, &bookGroup)
	}
	//fmt.Println("Create data for book groups table", len(bookGroups))
}

func deleteBookGroups() {
	ctx := context.Background()
	queries := db.New(db.Pool())
	for i := 0; i < len(users); i++ {
		err := queries.DeleteBookGroup(ctx, bookGroups[i].ID)
		if err != nil {
			fmt.Println(err)
		}
	}
	bookGroups = []*db.BookGroup{}
	deleteUsers()
	//fmt.Println("Delete data in book groups table done")
}

func createBookChapters() {
	createBookGroups()
	bookChapters = []*db.BookChapter{}
	ctx := context.Background()
	queries := db.New(db.Pool())
	var chapterNumberSql pgtype.Numeric
	var descriptionSql, textContextSql sql.NullString
	var chapterType string
	var bookGroupID, ownerID int32
	for i := 0; i < int(cntBookChapter); i++ {
		stringI := strconv.Itoa(i)
		err := chapterNumberSql.Scan(stringI)
		if err != nil {
			fmt.Println(err)
		}
		err = descriptionSql.Scan("description" + stringI)
		if err != nil {
			fmt.Println(err)
		}
		err = textContextSql.Scan("textContext" + stringI)
		if err != nil {
			fmt.Println(err)
		}
		chapterType = types[r.Intn(len(types))]
		if err != nil {
			fmt.Println(err)
		}
		bookGroupID = bookGroups[r.Intn(len(bookGroups))].ID
		ownerID = users[r.Intn(len(users))].ID
		bookChapter, err := queries.InsertBookChapter(ctx, db.InsertBookChapterParams{
			ChapterNumber: chapterNumberSql,
			Description:   descriptionSql,
			TextContext:   textContextSql,
			Type:          chapterType,
			BookGroupID:   bookGroupID,
			OwnerID:       ownerID,
		})
		if err != nil {
			fmt.Println(err)
		}
		bookChapters = append(bookChapters, &bookChapter)
	}
	//fmt.Println("Create data for book chapters table", len(bookChapters))
}

func deleteBookChapters() {
	ctx := context.Background()
	queries := db.New(db.Pool())
	for i := 0; i < len(users); i++ {
		err := queries.DeleteBookChapter(ctx, bookChapters[i].ID)
		if err != nil {
			fmt.Println(err)
		}
	}
	bookChapters = []*db.BookChapter{}
	deleteBookGroups()
	//fmt.Println("Delete data in book chapters table done")
}

func TestBookChapterById(t *testing.T) {
	db.Init()
	defer db.Close()
	createBookChapters()
	defer deleteBookChapters()
	intRandom := r.Intn(len(bookChapters))
	bookChapter1 := bookChapters[intRandom]
	bookChapter2, err := BookChapterById(bookChapter1.ID)
	if err != nil {
		t.Fatal(err)
	}
	assert.Equal(t, bookChapter1, bookChapter2)
}

func TestUpdateBookChapter(t *testing.T) {
	db.Init()
	defer db.Close()
	createBookChapters()
	defer deleteBookChapters()
	intRandom := r.Intn(len(bookChapters))
	bookChapter1 := bookChapters[intRandom]
	chapterNumber := "1224.123"
	description := "descriptionUpdate"
	textContext := "textContextUpdate"
	chapterType := types[r.Intn(len(types))]
	bookGroupID := bookGroups[r.Intn(len(bookGroups))].ID
	ownerID := users[r.Intn(len(users))].ID
	err := UpdateBookChapter(bookChapter1.ID, chapterNumber, description,
		textContext, chapterType, bookGroupID, ownerID)
	if err != nil {
		t.Fatal(err)
	}
	bookChapter2, err := BookChapterById(bookChapter1.ID)
	if err != nil {
		t.Fatal(err)
	}
	var tmp pgtype.Numeric
	_ = tmp.Scan(chapterNumber)
	if err != nil {
		t.Fatal(err)
	}
	assert.Equal(t, bookChapter2.ChapterNumber, tmp)
	assert.Equal(t, bookChapter2.Description.String, description)
	assert.Equal(t, bookChapter2.TextContext.String, textContext)
	assert.Equal(t, bookChapter2.Type, chapterType)
	assert.Equal(t, bookChapter2.BookGroupID, bookGroupID)
	assert.Equal(t, bookChapter2.OwnerID, ownerID)
}
func TestDeleteBookChapter(t *testing.T) {
	db.Init()
	defer db.Close()
	createBookChapters()
	defer deleteBookChapters()
	intRandom := r.Intn(len(bookChapters))
	bookChapter1 := bookChapters[intRandom]
	err := DeleteBookChapter(bookChapter1.ID)
	if err != nil {
		t.Fatal(err)
	}
	bookChapter2, err := BookChapterById(bookChapter1.ID)
	if bookChapter2 != nil {
		stringErr := fmt.Sprintf("Book chapters have not been deleted")
		t.Fatal(errors.New(stringErr))
	}
}
func TestCreateBookChapter(t *testing.T) {
	db.Init()
	defer db.Close()
	createBookChapters()
	defer deleteBookChapters()
	chapterNumber := "1224.123"
	description := "descriptionUpdate"
	textContext := "textContextUpdate"
	chapterType := types[r.Intn(len(types))]
	bookGroupID := bookGroups[r.Intn(len(bookGroups))].ID
	ownerID := users[r.Intn(len(users))].ID
	bookChapter1, err := CreateBookChapter(chapterNumber, description,
		textContext, chapterType, bookGroupID, ownerID)
	if err != nil {
		t.Fatal(err)
	}
	bookChapter2, err := BookChapterById(bookChapter1.ID)
	if err != nil {
		t.Fatal(err)
	}
	var tmp pgtype.Numeric
	_ = tmp.Scan(chapterNumber)
	if err != nil {
		t.Fatal(err)
	}
	assert.Equal(t, bookChapter2.ChapterNumber, tmp)
	assert.Equal(t, bookChapter2.Description.String, description)
	assert.Equal(t, bookChapter2.TextContext.String, textContext)
	assert.Equal(t, bookChapter2.Type, chapterType)
	assert.Equal(t, bookChapter2.BookGroupID, bookGroupID)
	assert.Equal(t, bookChapter2.OwnerID, ownerID)
	err = DeleteBookChapter(bookChapter2.ID)
	if err != nil {
		t.Fatal(err)
	}
}
func TestBookChaptersByBookGroupId(t *testing.T) {
	db.Init()
	defer db.Close()
	createBookChapters()
	defer deleteBookChapters()
	bookGroupID := bookGroups[r.Intn(len(bookGroups))].ID
	newBookChapters, err := BookChaptersByBookGroupId(bookGroupID, 1)
	if err != nil {
		t.Fatal(err)
	}
	for i := 0; i < len(bookChapters); i++ {
		if bookChapters[i].BookGroupID == bookGroupID {
			found := false
			for j := 0; j < len(newBookChapters); j++ {
				if bookChapters[i].ID == newBookChapters[j].ID {
					assert.Equal(t, bookChapters[i], newBookChapters[j])
					found = true
				}
			}
			if found != true {
				stringErr := fmt.Sprintf("Thiếu")
				t.Fatal(errors.New(stringErr))
			}
		}
	}
	for j := 0; j < len(newBookChapters); j++ {
		if newBookChapters[j].BookGroupID != bookGroupID {
			stringErr := fmt.Sprintf("Thừa")
			t.Fatal(errors.New(stringErr))
		}
	}
}
