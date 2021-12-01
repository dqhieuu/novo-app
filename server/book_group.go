package server

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"github.com/dqhieuu/novo-app/db"
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
)

const limitBookGroup = 50

type BookGroup struct {
	Name string `json:"name" binding:"required"`
	Description string `json:"description"`
	Views int64 `json:"views"`
	LikeCount int64 `json:"likeCount"`
	DislikeCount int64 `json:"dislikeCount"`
	Authors []Author `json:"authors"`
	Genres []Genre `json:"genres"`
	Chapters []Chapter `json:"chapters"`
	CoverArts []string `json:"coverArts"`
	PrimaryCoverArt string `json:"primaryCoverArt"`
}

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

func UpdateBookGroup(id int32, title string, description string, ownerId int32, genreIds []int32, authorIds []int32) error {
	ctx := context.Background()
	queries := db.New(db.Pool())
	err := queries.UpdateBookGroup(ctx, db.UpdateBookGroupParams{
		ID:    id,
		Title: title,
		Description: sql.NullString{
			String: description,
			Valid:  description != "",
		},
	})
	if err != nil {
		stringErr := fmt.Sprintf("Update book group failed: %s", err)
		return errors.New(stringErr)
	}

	err = DeleteGenresByBookGroup(id)
	if err != nil {
		stringErr := fmt.Sprintf("Update book group failed: %s", err)
		return errors.New(stringErr)
	}
	for i := 0; i < len(genreIds); i++ {
		_, err = CreateBookGroupGenre(id, genreIds[i])
		if err != nil {
			stringErr := fmt.Sprintf("Update book group failed: %s", err)
			return errors.New(stringErr)
		}
	}

	err = DeleteAuthorsByBookGroup(id)
	if err != nil {
		stringErr := fmt.Sprintf("Update book group failed: %s", err)
		return errors.New(stringErr)
	}
	for i := 0; i < len(authorIds); i++ {
		_, err = CreateBookGroupAuthor(id, authorIds[i])
		if err != nil {
			stringErr := fmt.Sprintf("Update book group failed: %s", err)
			return errors.New(stringErr)
		}
	}

	return nil
}

func CreateBookGroup(title string, description string, ownerId int32, genreIds []int32, authorIds []int32) (*db.BookGroup, error) {
	ctx := context.Background()
	queries := db.New(db.Pool())
	bookGroup, err := queries.InsertBookGroup(ctx, db.InsertBookGroupParams{
		Title: title,
		Description: sql.NullString{
			String: description,
			Valid:  description != "",
		},
	})
	if err != nil {
		stringErr := fmt.Sprintf("Create book group failed: %s", err)
		return nil, errors.New(stringErr)
	}

	for i := 0; i < len(genreIds); i++ {
		_, err = CreateBookGroupGenre(bookGroup.ID, genreIds[i])
		if err != nil {
			return nil, err
		}
	}

	for i := 0; i < len(authorIds); i++ {
		_, err = CreateBookGroupAuthor(bookGroup.ID, authorIds[i])
		if err != nil {
			return nil, err
		}
	}

	return &bookGroup, nil
}

func DeleteBookGroup(id int32) error {
	err := DeleteGenresByBookGroup(id)
	if err != nil {
		stringErr := fmt.Sprintf("Delete book group failed: %s", err)
		return errors.New(stringErr)
	}

	err = DeleteAuthorsByBookGroup(id)
	if err != nil {
		stringErr := fmt.Sprintf("Delete book group failed: %s", err)
		return errors.New(stringErr)
	}

	err = DeleteBookChapterByBookGroupId(id)
	if err != nil {
		stringErr := fmt.Sprintf("Delete book group failed: %s", err)
		return errors.New(stringErr)
	}

	ctx := context.Background()
	queries := db.New(db.Pool())
	err = queries.DeleteBookGroup(ctx, id)
	if err != nil {
		stringErr := fmt.Sprintf("Delete book group failed: %s", err)
		return errors.New(stringErr)
	}
	return nil
}

func GetBookGroupContentHandler(c *gin.Context) {
	ctx := context.Background()
	queries := db.New(db.Pool())

	bookGroupId := c.Param("bookGroupId")
	bookGroupId64, err := strconv.ParseInt(bookGroupId, 10, 32)
	if err != nil {
		ReportError(c, err, "error parsing book group id", 500)
		return
	}

	var responseObject BookGroup
	bookGroup, err := BookGroupById(int32(bookGroupId64))

	switch {
	case err == sql.ErrNoRows || len(bookGroup.Title) == 0 || bookGroup.ID == 0:
		ReportError(c, err, "book group does not exist", http.StatusBadRequest)
		return
	case err == nil:
		//get name and description
		responseObject.Name = bookGroup.Title
		responseObject.Description = bookGroup.Description.String

		//get views
		totalViews, err := queries.GetBookGroupView(ctx, bookGroup.ID)
		if err != nil {
			ReportError(c, err, "error getting total view", 500)
			return
		}
		responseObject.Views = totalViews.(int64)

		//get likes
		totalLikes, err := queries.GetLikes(ctx, bookGroup.ID)
		if err != nil {
			ReportError(c, err, "error getting likes", 500)
			return
		}
		responseObject.LikeCount = totalLikes.(int64)

		//get dislikes
		totalDislikes, err := queries.GetDislikes(ctx, bookGroup.ID)
		if err != nil {
			ReportError(c, err, "error getting dislikes", 500)
			return
		}
		responseObject.DislikeCount = totalDislikes.(int64)

		//get authors
		authors, err := queries.GetBookGroupAuthors(ctx, bookGroup.ID)
		if err != nil {
			ReportError(c, err, "error getting authors", 500)
			return
		}
		if len(authors) > 0 {
			for _, author := range authors {
				responseObject.Authors = append(responseObject.Authors, Author{
					Name: author.Name,
					Id:   author.ID,
				})
			}
		}

		//get genres
		genres, err := queries.GetBookGroupGenres(ctx, bookGroup.ID)
		if err != nil {
			ReportError(c, err, "error getting book group genres", 500)
			return
		}
		if len(genres) > 0 {
			for _, genre := range genres {
				responseObject.Genres = append(responseObject.Genres, Genre{
					Id:   genre.ID,
					Name: genre.Name,
				})
			}
		}

		//get chapters
		chapters, err := queries.GetBookGroupChapters(ctx, bookGroup.ID)
		if err != nil {
			ReportError(c, err, "error getting book group chapters", 500)
			return
		}
		if len(chapters) > 0 {
			for _, chapter := range chapters {
				userPosted, err := queries.GetBookChapterOwner(ctx, chapter.ID)
				if err != nil {
					ReportError(c, err, "error getting book chapter owner", 500)
					return
				}
				responseObject.Chapters = append(responseObject.Chapters, Chapter{
					ChapterNumber: chapter.ChapterNumber,
					Name:          chapter.Name.String,
					Id:            chapter.ID,
					TimePosted:    chapter.DateCreated.UnixMicro(),
					UserPosted:    Author{
						Id: userPosted.ID,
						Name: userPosted.UserName.String,
					},
				})
			}
		}

		//get cover arts
		coverArts, err := queries.GetBookGroupCoverArts(ctx, bookGroup.ID)
		if err != nil {
			ReportError(c, err, "error getting cover arts", 500)
			return
		}
		if len(coverArts) > 0 {
			for _, imagePath := range coverArts {
				responseObject.CoverArts = append(responseObject.CoverArts, imagePath)
			}
		}

		//get primary cover art
		primaryCoverArt, err := queries.GetImageBasedOnId(ctx, bookGroup.PrimaryCoverArtID.Int32)
		switch {
		case err == sql.ErrNoRows || len(primaryCoverArt.Md5) == 0:
		case len(primaryCoverArt.Md5) > 0:
			responseObject.PrimaryCoverArt = primaryCoverArt.Path
		default:
			ReportError(c, err, "error getting primary art", 500)
			return
		}
	default:
		ReportError(c, err, "error getting book group", 500)
		return
	}

	c.JSON(200, responseObject)
}
