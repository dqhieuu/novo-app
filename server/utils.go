package server

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"image"
	"image/color"
	"image/png"
	"log"
	"os"
	"regexp"
	"strings"
)

const (
	BookGroupModule = "book"
	BookChapterModule = "chapter"
	CommentModule = "comment"
	AuthorModule = "author"
	LikeModule = "like"
	PostAction = "post"
	ReadAction = "read"
	ModifyAction = "modify"
	DeleteAction = "delete"
	ModifySelfAction = "modifySelf"
	DeleteSelfAction = "deleteSelf"
)

func CreateImage(width int, height int) (*os.File, int64, string, string, error) {
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
	dst := "test/" + "test-" + uuid.NewString() + ".png"
	fullPath, _, err := checkFileDir(dst, RootFolder)
	if err != nil {
		return nil, -1, "", "", err
	}

	fileStream, setupErr := os.Create(fullPath)
	setupErr = png.Encode(fileStream, img)
	if setupErr != nil {
		return nil, -1, "", "", err
	}
	_, err = fileStream.Seek(0, 0)
	if err != nil {
		return nil, -1, "", "", err
	}
	imageStatus, setupErr := fileStream.Stat()
	if err != nil {
		return nil, -1, "", "", err
	}
	return fileStream, imageStatus.Size(), dst, fullPath, nil
}

func HasControlCharacters(content string) bool {
	hasInvalidChars, _ := regexp.MatchString(`[\x00-\x07\x0E-\x1F\x7F]`, content)
	return hasInvalidChars
}

func CheckEmptyString(content string) bool {
	if len(strings.TrimSpace(content)) == 0 {
		return true
	}
	return false
}

func ReportError(c *gin.Context, err error, message string, code int) {
	log.Printf("%s: %s\n", message, err)
	c.JSON(code, gin.H{
		"error": err.Error(),
	})
}
