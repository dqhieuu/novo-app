package server

import (
	"context"
	"errors"
	"fmt"
	"github.com/dqhieuu/novo-app/db"
	"github.com/stretchr/testify/assert"
	"sort"
	"testing"
)

func TestBookGroupGenre(t *testing.T) {
	db.Init()
	defer db.Close()
	createData()
	defer removeData()
	intRandom := r.Intn(len(bookGroupGenres))
	bookGroupId := bookGroupGenres[intRandom].BookGroupID
	genreId := bookGroupGenres[intRandom].GenreID
	result, err := BookGroupGenre(bookGroupId, genreId)
	if err != nil {
		t.Fatal(err)
	}
	if result != true {
		stringErr := fmt.Sprintf("Check BookGroupGenre exist failed")
		t.Fatal(errors.New(stringErr))
	}
}

func TestCreateAndDeleteBookGroupGenre(t *testing.T) {
	db.Init()
	defer db.Close()
	createData()
	defer removeData()
	ctx := context.Background()
	queries := db.New(db.Pool())
	intRand := r.Intn(len(bookGroupGenres))
	bookGroupId := bookGroupGenres[intRand].BookGroupID
	genreId := bookGroupGenres[intRand].GenreID

	//xóa
	err := DeleteBookGroupGenre(bookGroupId, genreId)
	if err != nil {
		t.Fatal(err)
	}

	//kiểm tra tồn tại
	result, _ := queries.BookGroupGenre(ctx, db.BookGroupGenreParams{
		BookGroupID: bookGroupId,
		GenreID:     genreId,
	})
	if result != false {
		stringErr := fmt.Sprintf("Delete BookGroupGenre failed")
		t.Fatal(errors.New(stringErr))
	}

	//tạo
	_, err = CreateBookGroupGenre(bookGroupId, genreId)
	if err != nil {
		t.Fatal(err)
	}

	//kiểm tra tồn tại
	result, _ = queries.BookGroupGenre(ctx, db.BookGroupGenreParams{
		BookGroupID: bookGroupId,
		GenreID:     genreId,
	})
	if result != true {
		stringErr := fmt.Sprintf("Create BookGroupGenre failed")
		t.Fatal(errors.New(stringErr))
	}

}

func TestBookGroupsByGenre(t *testing.T) {
	db.Init()
	defer db.Close()
	createData()
	defer removeData()

	for i := 0; i < len(genres); i++ {
		tmp1, err := BookGroupsByGenre(genres[i].ID, 1) //xét page 1
		if err != nil {
			t.Fatal(err)
		}
		var tmp2 []int32
		for j := 0; j < len(bookGroupGenres) && len(tmp2) <= limitBookGroup; j++ { // page1 có limitBookGroup phẩn tử
			if bookGroupGenres[j].GenreID == genres[i].ID {
				tmp2 = append(tmp2, bookGroupGenres[j].BookGroupID)
			}
		}
		assert.Equal(t, len(tmp1), len(tmp2))
		sort.Slice(tmp2, func(i, j int) bool {
			return tmp2[i] < tmp2[j]
		})
		sort.Slice(tmp1, func(i, j int) bool {
			return tmp1[i] < tmp1[j]
		})
		for j := 0; j < len(tmp1); j++ {
			assert.Equal(t, tmp1[j], tmp2[j])
		}
	}
}

func TestGenresByBookGroup(t *testing.T) {
	db.Init()
	defer db.Close()
	createData()
	defer removeData()

	for i := 0; i < len(genres); i++ {
		tmp1, err := GenresByBookGroup(bookGroups[i].ID, 1) //xét page 1
		if err != nil {
			t.Fatal(err)
		}
		var tmp2 []int32
		for j := 0; j < len(bookGroupGenres) && len(tmp2) <= limitGenres; j++ { // page1 có limitBookGroup phẩn tử
			if bookGroupGenres[j].BookGroupID == bookGroups[i].ID {
				tmp2 = append(tmp2, bookGroupGenres[j].GenreID)
			}
		}
		assert.Equal(t, len(tmp1), len(tmp2))
		sort.Slice(tmp2, func(i, j int) bool {
			return tmp2[i] < tmp2[j]
		})
		sort.Slice(tmp1, func(i, j int) bool {
			return tmp1[i] < tmp1[j]
		})
		for j := 0; j < len(tmp1); j++ {
			assert.Equal(t, tmp1[j], tmp2[j])
		}
	}
}

func TestDeleteBooksGroupByGenre(t *testing.T) {
	db.Init()
	defer db.Close()
	createData()
	defer removeData()

	for i := 0; i < len(genres); i++ {
		err := DeleteBookGroupsByGenre(genres[i].ID) //xóa theo genre
		if err != nil {
			t.Fatal(err)
		}

		tmp2, err := BookGroupsByGenre(genres[i].ID, 1) // kiểm tra đã xóa hết chưa
		if len(tmp2) > 0 {
			t.Fatal(errors.New("DeleteBookGroupByGenre failed"))
		}
	}
}

func TestDeleteGenresByBookGroup(t *testing.T) {
	db.Init()
	defer db.Close()
	createData()
	defer removeData()

	for i := 0; i < len(genres); i++ {

		err := DeleteGenresByBookGroup(bookGroups[i].ID) //xóa theo book group
		if err != nil {
			t.Fatal(err)
		}
		tmp, err := GenresByBookGroup(bookGroups[i].ID, 1)
		if len(tmp) > 0 {
			t.Fatal(errors.New("DeleteGenresByBookGroup failed"))
		}
	}
}
