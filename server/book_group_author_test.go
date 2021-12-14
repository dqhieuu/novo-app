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

func TestBookGroupAuthor(t *testing.T) {
	db.Init()
	defer db.Close()
	createData()
	defer removeData()
	intRandom := r.Intn(len(bookGroupAuthors))
	bookGroupId := bookGroupAuthors[intRandom].BookGroupID
	bookAuthorId := bookGroupAuthors[intRandom].BookAuthorID
	result, err := BookGroupAuthor(bookGroupId, bookAuthorId)
	if err != nil {
		t.Fatal(err)
	}
	if result != true {
		stringErr := fmt.Sprintf("Check BookGroupAuthor exist failed")
		t.Fatal(errors.New(stringErr))
	}
}

func TestCreateAndDeleteBookGroupAuthor(t *testing.T) {
	db.Init()
	defer db.Close()
	createData()
	defer removeData()
	ctx := context.Background()
	queries := db.New(db.Pool())
	intRand := r.Intn(len(bookGroupAuthors))
	bookGroupId := bookGroupAuthors[intRand].BookGroupID
	bookAuthorId := bookGroupAuthors[intRand].BookAuthorID

	//xóa
	err := DeleteBookGroupAuthor(bookGroupId, bookAuthorId)
	if err != nil {
		t.Fatal(err)
	}

	//kiểm tra tồn tại
	result, _ := queries.BookGroupAuthor(ctx, db.BookGroupAuthorParams{
		BookGroupID:  bookGroupId,
		BookAuthorID: bookAuthorId,
	})
	if result != false {
		stringErr := fmt.Sprintf("Delete BookGroupAuthor failed")
		t.Fatal(errors.New(stringErr))
	}

	//tạo
	_, err = CreateBookGroupAuthor(bookGroupId, bookAuthorId)
	if err != nil {
		t.Fatal(err)
	}

	//kiểm tra tồn tại
	result, _ = queries.BookGroupAuthor(ctx, db.BookGroupAuthorParams{
		BookGroupID:  bookGroupId,
		BookAuthorID: bookAuthorId,
	})
	if result != true {
		stringErr := fmt.Sprintf("Create BookGroupAuthor failed")
		t.Fatal(errors.New(stringErr))
	}

}

//func TestBookGroupsByBookAuthor(t *testing.T) {
//	db.Init()
//	defer db.Close()
//	createData()
//	defer removeData()
//
//	for i := 0; i < len(bookAuthors); i++ {
//		tmp1, err := BookGroupsByAuthor(bookAuthors[i].ID, 1) //xét page 1
//		if err != nil {
//			t.Fatal(err)
//		}
//		var tmp2 []int32
//		for j := 0; j < len(bookGroupAuthors) && len(tmp2) <= limitBookGroup; j++ { // page1 có limitBookGroup phẩn tử
//			if bookGroupAuthors[j].BookAuthorID == bookAuthors[i].ID {
//				tmp2 = append(tmp2, bookGroupAuthors[j].BookGroupID)
//			}
//		}
//		assert.Equal(t, len(tmp1), len(tmp2))
//		sort.Slice(tmp2, func(i, j int) bool {
//			return tmp2[i] < tmp2[j]
//		})
//		sort.Slice(tmp1, func(i, j int) bool {
//			return tmp1[i] < tmp1[j]
//		})
//		for j := 0; j < len(tmp1); j++ {
//			assert.Equal(t, tmp1[j], tmp2[j])
//		}
//	}
//}

func TestBookAuthorsByBookGroup(t *testing.T) {
	db.Init()
	defer db.Close()
	createData()
	defer removeData()

	for i := 0; i < len(bookAuthors); i++ {
		tmp1, err := AuthorsByBookGroup(bookGroups[i].ID, 1) //xét page 1
		if err != nil {
			t.Fatal(err)
		}
		var tmp2 []int32
		for j := 0; j < len(bookGroupAuthors) && len(tmp2) <= limitBookAuthors; j++ { // page1 có limitBookGroup phẩn tử
			if bookGroupAuthors[j].BookGroupID == bookGroups[i].ID {
				tmp2 = append(tmp2, bookGroupAuthors[j].BookAuthorID)
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

//func TestDeleteBooksGroupByBookAuthor(t *testing.T) {
//	db.Init()
//	defer db.Close()
//	createData()
//	defer removeData()
//
//	for i := 0; i < len(bookAuthors); i++ {
//		err := DeleteBookGroupsByBookAuthor(bookAuthors[i].ID) //xóa theo bookAuthor
//		if err != nil {
//			t.Fatal(err)
//		}
//
//		tmp2, err := BookGroupsByAuthor(bookAuthors[i].ID, 1) // kiểm tra đã xóa hết chưa
//		if len(tmp2) > 0 {
//			t.Fatal(errors.New("DeleteBookGroupByBookAuthor failed"))
//		}
//	}
//}

func TestDeleteBookAuthorsByBookGroup(t *testing.T) {
	db.Init()
	defer db.Close()
	createData()
	defer removeData()

	for i := 0; i < len(bookAuthors); i++ {

		err := DeleteAuthorsByBookGroup(bookGroups[i].ID) //xóa theo book group
		if err != nil {
			t.Fatal(err)
		}
		tmp, err := AuthorsByBookGroup(bookGroups[i].ID, 1)
		if len(tmp) > 0 {
			t.Fatal(errors.New("DeleteBookAuthorsByBookGroup failed"))
		}
	}
}
