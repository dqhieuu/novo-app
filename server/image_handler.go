package server

import (
	"errors"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"io"
	"log"
)

const (
	ChapterImage = "chapter-image"
	UserAvatar = "user-avatar"
	AuthorAvatar = "author-avatar"
	GenreImage = "genre-image"
	CoverArt = "cover-art"
)

func UploadImageHandler(c *gin.Context) {
	imageCategory := c.Param("imageType")
	switch imageCategory {
	case ChapterImage, UserAvatar, AuthorAvatar, GenreImage, CoverArt:
	default:
		c.JSON(406, gin.H{
			"error": "invalid image category",
		})
		return
	}
	file, err := c.FormFile("file")
	if err != nil {
		log.Printf("error getting request body: %s\n", err)
		c.JSON(400, gin.H{
			"error": "error getting file stream",
		})
		return
	}
	if checkFileSize(file.Size) {
		c.JSON(413, gin.H{
			"error": "file too large",
		})
		return
	}
	filestream, err := file.Open()
	if err != nil {
		log.Printf("error getting file stream: %s\n", err)
		c.JSON(500, gin.H{
			"error": err.Error(),
		})
		return
	}
	saveImageName := uuid.NewString()
	saveImageId, savePath, err := SaveImageFromStream(filestream, imageCategory, saveImageName, "")
	switch err {
	case errors.New("unsupported media type"):
		c.JSON(415, gin.H{
			"error": err.Error(),
		})
	case nil:
		c.JSON(200, gin.H{
			"id": saveImageId,
		})
	default:
		c.JSON(500, gin.H{
			"error": err.Error(),
		})
	}
	_, err = filestream.Seek(0, io.SeekStart)
	if err != nil {
		log.Printf("error resetting file pointer: %s\n", err)
		return
	}
	outType := "image/jpeg"
	_, err = GenerateThumbnail(savePath, 512, &outType)
	if err != nil {
		log.Printf("error generating 512 width thumbnail")
	}
	_, err = GenerateThumbnail(savePath, 256, &outType)
	if err != nil {
		log.Printf("error generating 256 width thumbnail")
	}
	_, err = GenerateThumbnail(savePath, 128, &outType)
	if err != nil {
		log.Printf("error generating 128 width thumbnail")
	}
	_, err = GenerateThumbnail(savePath, 64, &outType)
	if err != nil {
		log.Printf("error generating 64 width thumbnail")
	}
}