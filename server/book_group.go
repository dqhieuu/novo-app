package server

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"github.com/dqhieuu/novo-app/db"
)

const limitBookGroup = 50

func BookGroupById(id int32) (*db.BookGroup, error) {
	ctx := context.Background()
	queries := db.New(db.Pool())
	data, err := queries.BookGroupById(ctx, id)
	if err != nil {
		stringErr := fmt.Sprintf("Get book group by id failed: %s", err)
		return nil, errors.New(stringErr)
	}
	return &data, err
}

func BookGroupsByTitle(title string, page int32) ([]*db.BookGroup, error) {
	ctx := context.Background()
	queries := db.New(db.Pool())
	bookGroups, err := queries.BookGroupsByTitle(ctx, db.BookGroupsByTitleParams{
		Column1: sql.NullString{
			String: title,
			Valid:  true, // chuỗi rỗng sẽ liệt kê tất cả
		},
		Offset: (page - 1) * limitBookGroup,
		Limit:  limitBookGroup,
	})
	if err != nil {
		stringErr := fmt.Sprintf("Get bookGroups by title failed: %s", err)
		return nil, errors.New(stringErr)
	}
	var outData []*db.BookGroup
	for i := 0; i < len(bookGroups); i++ {
		outData = append(outData, &bookGroups[i])
	}
	return outData, err
}

//Chưa viết hàm test
/*func BookGroupsByGenre(genreId, page int32) ([]*db.BookGroup, error) {
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
	var outData []*db.BookGroup
	for i := 0; i < len(bookGroups); i++ {
		outData = append(outData, &bookGroups[i])
	}
	return outData, err
}

func BookGroupsByAuthor(authorId, page int32) ([]*db.BookGroup, error) {
	ctx := context.Background()
	queries := db.New(db.Pool())
	bookGroups, err := queries.BookGroupsByAuthor(ctx, db.BookGroupsByAuthorParams{
		BookAuthorID: authorId,
		Offset:       (page - 1) * limitBookGroup,
		Limit:        limitBookGroup,
	})
	if err != nil {
		stringErr := fmt.Sprintf("Get bookGroups by author failed: %s", err)
		return nil, errors.New(stringErr)
	}
	var outData []*db.BookGroup
	for i := 0; i < len(bookGroups); i++ {
		outData = append(outData, &bookGroups[i])
	}
	return outData, err
}*/

func UpdateBookGroup(id int32, title string, description string, ownerId int32) error {
	ctx := context.Background()
	queries := db.New(db.Pool())
	err := queries.UpdateBookGroup(ctx, db.UpdateBookGroupParams{
		ID:    id,
		Title: title,
		Description: sql.NullString{
			String: description,
			Valid:  description != "",
		},
		Ownerid: ownerId,
	})
	if err != nil {
		stringErr := fmt.Sprintf("Update book group failed: %s", err)
		return errors.New(stringErr)
	}
	return nil
}

func CreateBookGroup(title string, description string, Ownerid int32) (*db.BookGroup, error) {
	ctx := context.Background()
	queries := db.New(db.Pool())
	outData, err := queries.InsertBookGroup(ctx, db.InsertBookGroupParams{
		Title: title,
		Description: sql.NullString{
			String: description,
			Valid:  description != "",
		},
		Ownerid: Ownerid,
	})
	if err != nil {
		stringErr := fmt.Sprintf("Create book group failed: %s", err)
		return nil, errors.New(stringErr)
	}
	return &outData, nil
}

func DeleteBookGroup(id int32) error {
	ctx := context.Background()
	queries := db.New(db.Pool())
	err := queries.DeleteBookGroup(ctx, id)
	if err != nil {
		stringErr := fmt.Sprintf("Delete book group failed: %s", err)
		return errors.New(stringErr)
	}
	return nil
}
