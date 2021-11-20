package server

import (
	"github.com/google/uuid"
	"image"
	"image/color"
	"image/png"
	"log"
	"os"
	"testing"
)

func createImage() (*os.File, string) {
	width := 200
	height := 100

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
		log.Fatalf("Error encoding test image: %s\n", setupErr)
	}
	_, err := fileStream.Seek(0, 0)
	if err != nil {
		log.Fatalf("Error reseting file pointer: %s\n", setupErr)
	}
	return fileStream, dst
}

func TestGenerateImageHash(t *testing.T) {
	img, dst := createImage()
	_, _, err := generateHashes(img)
	err = img.Close()
	if err != nil {
		t.Errorf("Error closing file stream: %s\n", err)
	}
	setupErr := os.Remove(dst)
	if setupErr != nil {
		t.Errorf("Error removing test image: %s\n", setupErr)
	}
	if err != nil {
		t.Fatalf("Hash function not working properly: %s\n", err)
	}
}

func TestGetImageType(t *testing.T) {
	img, dst := createImage()
	imgType, err := getImageType(img)
	err = img.Close()
	if err != nil {
		t.Errorf("Error closing file stream: %s\n", err)
	}
	setupErr := os.Remove(dst)
	if setupErr != nil {
		t.Errorf("Error removing test image: %s\n", setupErr)
	}
	if err != nil || imgType != "image/png" {
		t.Fatalf("Get image type function not working properly: %s\n", err)
	}
}

func TestResizeImage(t *testing.T) {
	img, dst := createImage()
	resizeDst := "test-" + uuid.NewString() + ".png"
	err := ResizeImage(img, ResizeImageParams{
		InType:  "image/png",
		OutType: "image/png",
		OutDst:  resizeDst,
		Width:   100,
		Height:  0,
	})
	err = img.Close()
	if err != nil {
		t.Errorf("Error closing file stream: %s\n", err)
	}
	setupErr := os.Remove(dst)
	if setupErr != nil {
		t.Errorf("Error removing test image: %s\n", setupErr)
	}
	setupErr = os.Remove(resizeDst)
	if setupErr != nil {
		t.Errorf("Error removing resize test image: %s\n", setupErr)
	}
	if err != nil {
		t.Fatalf("Resize image function not working properly: %s\n", err)
	}
}
