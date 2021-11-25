package server

import (
	"context"
	"database/sql"
	"fmt"
	"github.com/dqhieuu/novo-app/db"
	"github.com/jackc/pgtype"
	"math/rand"
	"strconv"
	"time"
)

var roleNames = []string{"member", "moderator", "admin"}
var users []*db.User
var genres []*db.Genre
var bookGroups []*db.BookGroup
var bookGroupGenres []*db.BookGroupGenre
var bookChapters []*db.BookChapter

var types = []string{"images", "hypertext"}

const cntRole int32 = 3
const cntUser int32 = 5
const cntGenres int32 = 5
const cntBookGroup int32 = 5
const cntBookGroupGenres int32 = 10
const cntBookChapter int32 = 5

var r *rand.Rand

func createUsers() {
	users = []*db.User{}
	ctx := context.Background()
	queries := db.New(db.Pool())

	username := sql.NullString{}
	password := sql.NullString{}

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
	//for i := 0; i < len(users); i++ {
	//	fmt.Println(users[i])
	//}
	//fmt.Println("*************************")
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
	//for i := 0; i < len(bookGroups); i++ {
	//	fmt.Println(bookGroups[i])
	//}
	//fmt.Println("*************************")
}

func deleteBookGroups() {
	ctx := context.Background()
	queries := db.New(db.Pool())
	for i := 0; i < len(bookGroups); i++ {
		err := queries.DeleteBookGroup(ctx, bookGroups[i].ID)
		if err != nil {
			fmt.Println(err)
		}
	}
	bookGroups = []*db.BookGroup{}
	//fmt.Println("Delete data in book groups table done")
}

func createBookChapters() {
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
	//for i := 0; i < len(bookChapters); i++ {
	//	fmt.Println(bookChapters[i])
	//}
	//fmt.Println("*************************")
}

func deleteBookChapters() {
	ctx := context.Background()
	queries := db.New(db.Pool())
	for i := 0; i < len(bookChapters); i++ {
		err := queries.DeleteBookChapterById(ctx, bookChapters[i].ID)
		if err != nil {
			fmt.Println(err)
		}
	}
	bookChapters = []*db.BookChapter{}
	//fmt.Println("Delete data in book chapters table done")
}

func createGenres() {
	genres = []*db.Genre{}
	ctx := context.Background()
	queries := db.New(db.Pool())
	var name string
	var description sql.NullString
	var imageId sql.NullInt32
	for i := 0; i < int(cntGenres); i++ {
		stringI := strconv.Itoa(i)
		name = "name" + stringI
		err := description.Scan("description" + stringI)
		if err != nil {
			fmt.Println(err)
		}
		imageId = sql.NullInt32{}
		genre, err := queries.InsertGenre(ctx, db.InsertGenreParams{
			Name:        name,
			Description: description,
			ImageID:     imageId,
		})
		if err != nil {
			fmt.Println(err)
		}
		genres = append(genres, &genre)
	}
	//fmt.Println("Create data for genres table", len(genres))
	//for i := 0; i < len(genres); i++ {
	//	fmt.Println(genres[i])
	//}
	//fmt.Println("*************************")
}

func deleteGenres() {
	ctx := context.Background()
	queries := db.New(db.Pool())
	for i := 0; i < len(genres); i++ {
		err := queries.DeleteGenre(ctx, genres[i].ID)
		if err != nil {
			fmt.Println(err)
		}
	}
	genres = []*db.Genre{}
}

func createBookGroupGenres() {
	bookGroupGenres = []*db.BookGroupGenre{}
	ctx := context.Background()
	queries := db.New(db.Pool())
	sqrt := 3
	for i := 0; i < int(cntBookGroupGenres); i++ {
		rand1 := int32(i / sqrt)
		rand2 := int32(i % sqrt)
		bookGroupId := bookGroups[rand1].ID
		genreId := genres[rand2].ID
		bookGroupGenre, err := queries.InsertBookGroupGenre(ctx, db.InsertBookGroupGenreParams{
			BookGroupID: bookGroupId,
			GenreID:     genreId,
		})
		if err != nil {
			fmt.Println(err)
		}
		bookGroupGenres = append(bookGroupGenres, &bookGroupGenre)
	}
	//fmt.Println("Create data for genres table", len(bookGroupGenres))
	//for i := 0; i < len(bookGroupGenres); i++ {
	//	fmt.Println(bookGroupGenres[i])
	//}
	//fmt.Println("*************************")
}

func deleteBookGroupGenres() {
	ctx := context.Background()
	queries := db.New(db.Pool())
	for i := 0; i < len(bookGroupGenres); i++ {
		err := queries.DeleteBookGroupGenre(ctx, db.DeleteBookGroupGenreParams{
			BookGroupID: bookGroupGenres[i].BookGroupID,
			GenreID:     bookGroupGenres[i].GenreID,
		})
		if err != nil {
			fmt.Println(err)
		}
	}
	bookGroupGenres = []*db.BookGroupGenre{}
}

func createData() {
	s := rand.NewSource(time.Now().UnixNano())
	r = rand.New(s)
	createUsers()
	createBookGroups()
	createGenres()
	createBookGroupGenres()
	createBookChapters()
}
func removeData() {
	defer deleteUsers()
	defer deleteBookGroups()
	defer deleteGenres()
	defer deleteBookGroupGenres()
	defer deleteBookChapters()
}
