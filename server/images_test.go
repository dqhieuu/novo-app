package server

import (
	"context"
	"database/sql"
	"github.com/dqhieuu/novo-app/db"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"image"
	"image/color"
	"image/png"
	"log"
	"os"
	"testing"
)

const DefaultWidth = 200
const DefaultHeight = 100

func createImage(width int, height int) (*os.File, int64, string) {
	upLeft := image.Point{}
	lowRight := image.Point{X: width, Y: height}

	img := image.NewRGBA(image.Rectangle{Min: upLeft, Max: lowRight})

	// Colors are defined by Red, Green, Blue, Alpha uint8 values.
	cyan := color.RGBA{R: 100, G: 200, B: 200, A: 0xff}

	// Set color for each pixel.
	for x := 0; x < width; x++ {
		for y := 0; y < height; y++ {
			switch {
			case x < width/2 && y < height/2: // upper left quadrant
				img.Set(x, y, cyan)
			case x >= width/2 && y >= height/2: // lower right quadrant
				img.Set(x, y, color.White)
			default:
				// Use zero value.
			}
		}
	}
	dst := "test-" + uuid.NewString() + ".png"
	fileStream, setupErr := os.Create(dst)
	setupErr = png.Encode(fileStream, img)
	if setupErr != nil {
		log.Printf("Error encoding test image: %s\n", setupErr)
	}
	_, err := fileStream.Seek(0, 0)
	if err != nil {
		log.Printf("Error reseting file pointer: %s\n", setupErr)
	}
	imageStatus, setupErr := fileStream.Stat()
	if err != nil {
		log.Printf("Error getting image status: %s\n", setupErr)
	}
	return fileStream, imageStatus.Size(), dst
}

func TestGenerateImageHash(t *testing.T) {
	img, _, dst := createImage(DefaultWidth, DefaultHeight)
	md5Hash, sha1Hash, err := generateHashes(img)
	log.Println(md5Hash)
	log.Println(sha1Hash)
	setupErr := img.Close()
	if setupErr != nil {
		t.Fatalf("Error closing file stream: %s\n", err)
	}
	setupErr = os.Remove(dst)
	if setupErr != nil {
		t.Fatalf("Error removing test image: %s\n", setupErr)
	}
	assert.Nil(t, err)
}

func TestGetImageType(t *testing.T) {
	img, _, dst := createImage(DefaultWidth, DefaultHeight)
	imgType, err := getImageType(img)
	setupErr := img.Close()
	if setupErr != nil {
		t.Fatalf("Error closing file stream: %s\n", err)
	}
	setupErr = os.Remove(dst)
	if setupErr != nil {
		t.Fatalf("Error removing test image: %s\n", setupErr)
	}
	assert.Nil(t, err)
	assert.Equal(t, "image/png", imgType, "The image should be in png")
}

func TestResizeImage(t *testing.T) {
	img, _, dst := createImage(DefaultWidth, DefaultHeight)
	resizeDst := "test-" + uuid.NewString() + ".png"
	err := ResizeImage(img, ResizeImageParams{
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
	setupErr = os.Remove(dst)
	if setupErr != nil {
		t.Errorf("Error removing test image: %s\n", setupErr)
	}
	setupErr = os.Remove(resizeDst)
	if setupErr != nil {
		t.Errorf("Error removing resize test image: %s\n", setupErr)
	}
	assert.Nil(t, err)
}

func TestProcessImages(t *testing.T) {
	db.Init()
	ctx := context.Background()
	queries := db.New(db.Pool())

	img1, size1, dst1 := createImage(200, 100)
	img2, size2, dst2 := createImage(400, 200)
	img3, size3, dst3 := createImage(600, 300)

	var files []Image
	files = append(files, Image{
		Data: img1,
		Size: size1,
	})
	files = append(files, Image{
		Data: img2,
		Size: size2,
	})
	files = append(files, Image{
		Data: img3,
		Size: size3,
	})

	status := ProcessImages(ReceiveImagesParams{
		Files:       files,
		Description: "",
	})

	for _, stat := range status {
		assert.Nil(t, stat.Err)
		log.Println(stat.Id)
	}

	defer func() {
		for _, stat := range status {
			if stat.Id > 0 {
				err := queries.DeleteTempImage(ctx, stat.Id)
				if err != nil {
					t.Fatalf("Error deleting temp image: %s\n", err)
				}
				err = queries.DeleteImage(ctx, stat.Id)
				if err != nil {
					t.Fatalf("Error deleting image: %s\n", err)
				}
			}
		}
		err := os.Remove(dst1)
		if err != nil {
			t.Fatalf("Error deleting test file: %s\n", err)
		}
		err = os.Remove(dst2)
		if err != nil {
			t.Fatalf("Error deleting test file: %s\n", err)
		}
		err = os.Remove(dst3)
		if err != nil {
			t.Fatalf("Error deleting test file: %s\n", err)
		}
	}()
}

func TestServeThumbnail(t *testing.T) {
	db.Init()
	ctx := context.Background()
	queries := db.New(db.Pool())

	img, size, dst := createImage(600, 400)

	_, thumbnailId, err := ServeThumbnail(ServeThumbnailParams{
		File: img,
		ResizeParams: ResizeImageParams{
			InType:  "image/png",
			OutType: "image/png",
			OutDst:  "",
			Width:   300,
			Height:  0,
		},
		Size:          size,
		Description:   "",
		ThumbnailType: "user_avatars",
	})

	assert.Nil(t, err)
	log.Println(thumbnailId)
	defer func() {
		err := queries.DeleteImage(ctx, thumbnailId)
		if err != nil {
			t.Fatalf("Error deleting image: %s\n", err)
		}
		err = os.Remove(dst)
		if err != nil {
			t.Fatalf("Error deleting test file: %s\n", err)
		}
	}()
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

func TestProcessImageByUrl(t *testing.T) {
	db.Init()
	ctx := context.Background()
	queries := db.New(db.Pool())

	imageId, err := ProcessImageByUrl("https://files.catbox.moe/fwctkw.jpeg", "")
	log.Println(imageId)
	assert.Nil(t, err)
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
