package server

import (
	"errors"
	"fmt"
	"github.com/dqhieuu/novo-app/db"
	"github.com/jackc/pgtype"
	"github.com/stretchr/testify/assert"
	"sort"
	"testing"
)

func TestBookChapterById(t *testing.T) {
	db.Init()
	defer db.Close()
	createData()
	defer removeData()

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
	createData()
	defer removeData()

	intRandom := r.Intn(len(bookChapters))
	bookChapter1 := bookChapters[intRandom]
	chapterNumber := 1224.123
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
	assert.Equal(t, bookChapter2.Name.String, description)
	assert.Equal(t, bookChapter2.TextContext.String, textContext)
	assert.Equal(t, bookChapter2.Type, chapterType)
	assert.Equal(t, bookChapter2.BookGroupID, bookGroupID)
	assert.Equal(t, bookChapter2.OwnerID, ownerID)
}
func TestDeleteBookChapter(t *testing.T) {
	db.Init()
	defer db.Close()
	createData()
	defer removeData()

	intRandom := r.Intn(len(bookChapters))
	bookChapter1 := bookChapters[intRandom]
	err := DeleteBookChapterById(bookChapter1.ID)
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
	createData()
	defer removeData()

	chapterNumber := 1224.123
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
	assert.Equal(t, bookChapter2.Name.String, description)
	assert.Equal(t, bookChapter2.TextContext.String, textContext)
	assert.Equal(t, bookChapter2.Type, chapterType)
	assert.Equal(t, bookChapter2.BookGroupID, bookGroupID)
	assert.Equal(t, bookChapter2.OwnerID, ownerID)
	err = DeleteBookChapterById(bookChapter2.ID)
	if err != nil {
		t.Fatal(err)
	}
}
func TestBookChaptersByBookGroupId(t *testing.T) {
	db.Init()
	defer db.Close()
	createData()
	defer removeData()

	bookGroupID := bookGroups[r.Intn(len(bookGroups))].ID
	tmp1, err := BookChaptersByBookGroupId(bookGroupID, 1)
	if err != nil {
		t.Fatal(err)
	}

	var tmp2 []*db.BookChapter
	for i := 0; i < len(bookChapters) && i < limitChapter; i++ {
		if bookChapters[i].BookGroupID == bookGroupID {
			tmp2 = append(tmp2, bookChapters[i])
		}
	}

	sort.Slice(tmp2, func(i, j int) bool {
		return tmp2[i].ID < tmp2[j].ID
	})
	sort.Slice(tmp1, func(i, j int) bool {
		return tmp1[i].ID < tmp1[j].ID
	})
	for j := 0; j < len(tmp1); j++ {
		assert.Equal(t, tmp1[j], tmp2[j])
	}
}

func TestDeleteBookChapterByBookGroupId(t *testing.T) {
	db.Init()
	defer db.Close()
	createData()
	defer removeData()

	intRand := r.Intn(len(bookGroups))
	bookGroupID := bookGroups[intRand].ID
	err := DeleteBookChapterByBookGroupId(bookGroupID)
	if err != nil {
		t.Fatal(err)
	}

	tmp, err := BookChaptersByBookGroupId(bookGroupID, 1)
	if err != nil {
		fmt.Println(err)
	}
	if len(tmp) > 0 {
		stringErr := fmt.Sprintf("Xóa chưa sạch")
		t.Fatal(errors.New(stringErr))
	}
}
