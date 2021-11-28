package server

import (
	"context"
	"database/sql"
	"github.com/dqhieuu/novo-app/db"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"log"
	"os"
	"path/filepath"
	"testing"
)

const DefaultWidth = 200
const DefaultHeight = 100

func TestGenerateImageHash(t *testing.T) {
	img, _, _, absPath, err := CreateImage(DefaultWidth, DefaultHeight)
	if err != nil {
		t.Fatalf("Error creating test image: %s\n", err)
	}
	md5Hash, sha1Hash, err := generateHashes(img)
	log.Println(md5Hash)
	log.Println(sha1Hash)
	setupErr := img.Close()
	if setupErr != nil {
		t.Fatalf("Error closing file stream: %s\n", err)
	}
	setupErr = os.Remove(absPath)
	if setupErr != nil {
		t.Fatalf("Error removing test image: %s\n", setupErr)
	}
	assert.Nil(t, err)
}

func TestGetImageType(t *testing.T) {
	img, _, _, absPath, err := CreateImage(DefaultWidth, DefaultHeight)
	if err != nil {
		t.Fatalf("Error creating test image: %s\n", err)
	}
	imgType, err := getImageType(img)
	setupErr := img.Close()
	if setupErr != nil {
		t.Fatalf("Error closing file stream: %s\n", err)
	}
	setupErr = os.Remove(absPath)
	if setupErr != nil {
		t.Fatalf("Error removing test image: %s\n", setupErr)
	}
	assert.Nil(t, err)
	assert.Equal(t, "image/png", imgType, "The image should be in png")
}

func TestResizeImage(t *testing.T) {
	img, _, _, absPath, err := CreateImage(DefaultWidth, DefaultHeight)
	if err != nil {
		t.Fatalf("Error creating test image: %s\n", err)
	}
	resizeDst := filepath.Dir(absPath) + "/" + "test-" + uuid.NewString() + ".png"
	err = ResizeImage(img, ResizeImageParams{
		InType:  "image/png",
		OutType: "image/png",
		OutDst:  resizeDst,
		Width:   100,
		Height:  0,
	})
	setupErr := img.Close()
	if setupErr != nil {
		t.Errorf("Error closing file stream: %s\n", err)
	}
	setupErr = os.Remove(absPath)
	if setupErr != nil {
		t.Errorf("Error removing test image: %s\n", setupErr)
	}
	setupErr = os.Remove(resizeDst)
	if setupErr != nil {
		t.Errorf("Error removing resize test image: %s\n", setupErr)
	}
	assert.Nil(t, err)
}

func TestSubmitImages(t *testing.T) {
	db.Init()
	ctx := context.Background()
	queries := db.New(db.Pool())

	imageId, err := queries.InsertImage(ctx, db.InsertImageParams{
		Md5:  "random",
		Sha1: "random",
		Path: "random",
		Name: sql.NullString{
			Valid: false,
		},
		Description: sql.NullString{
			Valid: false,
		},
	})

	if err != nil {
		t.Fatalf("Error inserting test image row: %s\n", err)
	}

	ids := []int32{imageId}

	err = SubmitImages(ids)

	assert.Nil(t, err)
	defer func() {
		err := queries.DeleteImage(ctx, imageId)
		if err != nil {
			t.Fatalf("Error deleting test image row: %s\n", err)
		}
	}()
}

func TestCleanImages(t *testing.T) {
	db.Init()
	ctx := context.Background()
	queries := db.New(db.Pool())

	_, err := queries.InsertImage(ctx, db.InsertImageParams{
		Md5:  "random",
		Sha1: "random",
		Path: "random",
		Name: sql.NullString{
			Valid: false,
		},
		Description: sql.NullString{
			Valid: false,
		},
	})

	if err != nil {
		t.Fatalf("Error inserting test image row: %s\n", err)
	}

	err = CleanImages()
	assert.Nil(t, err)
}

func TestGenerateThumbnail(t *testing.T) {
	_, _, dst, absPath, err := CreateImage(400, 600)
	if err != nil {
		t.Fatalf("Error creating test image: %s\n", err)
	}

	outType := "image/png"

	newDst, err := GenerateThumbnail(dst, 300, &outType)
	log.Println(newDst)

	assert.Nil(t, err)
	defer func() {
		err = os.Remove(absPath)
		if err != nil {
			t.Fatalf("Error deleting test file: %s\n", err)
		}
	}()
}

func TestSaveImageFromStream(t *testing.T) {
	db.Init()
	ctx := context.Background()
	queries := db.New(db.Pool())

	img, _, _, absPath, err := CreateImage(400, 600)
	if err != nil {
		t.Fatalf("Error creating test image: %s\n", err)
	}

	imageId, _, err := SaveImageFromStream(img, "test", uuid.NewString(), "")

	assert.Nil(t, err)

	err = img.Close()
	if err != nil {
		t.Errorf("Error closing file stream: %s\n", err)
	}
	err = os.Remove(absPath)
	if err != nil {
		t.Errorf("Error removing test image: %s\n", err)
	}

	defer func() {
		err := queries.DeleteTempImage(ctx, imageId)
		if err != nil {
			t.Fatalf("Error deleting temp image: %s\n", err)
		}
		err = queries.DeleteImage(ctx, imageId)
		if err != nil {
			t.Fatalf("Error deleting image: %s\n", err)
		}
	}()
}
