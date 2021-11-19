package server

import (
	"bytes"
	"crypto/md5"
	"crypto/sha1"
	"database/sql"
	"encoding/hex"
	"github.com/dqhieuu/novo-app/db"
	"image"
	"image/gif"
	"image/jpeg"
	"image/png"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"strconv"

	//"encoding/json"
	//"github.com/dqhieuu/novo-app/db"
	"github.com/disintegration/imaging"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"log"
)

const MaxSize = 1024 * 1024 * 10
type Image struct{
	Id int32 `json:"id"`
	Filename string `json:"filename"`
	URL string `json:"url"`
}

func newFileName (fileType string) string {
	var ext string
	switch fileType {
	case "image/jpeg":
		ext = ".jpg"
	case "image/png":
		ext = ".png"
	case "image/gif":
		ext = ".gif"
	}
	return uuid.NewString() + ext
}

func getImageType(f multipart.File) (string, error) {
	buffer := make([]byte, 512)
	if _, err := f.Read(buffer); err != nil {
		return "", err
	}
	imageType := http.DetectContentType(buffer)
	f.Seek(0, io.SeekStart)
	return imageType, nil
}

func detectImageType(imgType string) bool {
	switch imgType {
	case "image/jpeg", "image/png", "image/gif":
		return true
	}
	return false
}

func generateHashes(f io.Reader) (string, string, error) {
	var sha1Stream bytes.Buffer
	md5Stream := io.TeeReader(f, &sha1Stream)

	md5Hash := md5.New()
	sha1Hash := sha1.New()

	_, err := io.Copy(md5Hash, md5Stream)
	if err != nil {
		return "", "", err
	}

	_, err = io.Copy(sha1Hash, &sha1Stream)
	if err != nil {
		return "", "", err
	}
	return hex.EncodeToString(md5Hash.Sum(nil)), hex.EncodeToString(sha1Hash.Sum(nil)), nil
}

func ResizeImage(f multipart.File, w int, h int, outType string, outDst string) {
	var srcImg image.Image
	fileType, err := getImageType(f)
	if err != nil {
		log.Fatalf("Error getting image type: %s\n", err)
	}
	switch fileType {
	case "image/jpeg":
		srcImg, err = jpeg.Decode(f)
	case "image/png":
		srcImg, err = png.Decode(f)
	case "image/gif":
		srcImg, err = gif.Decode(f)
	}

	if err != nil {
		log.Fatalf("Error decoding image: %s\n", err)
	}

	dstImg := imaging.Resize(srcImg, w, h, imaging.MitchellNetravali)

	out, _ := os.Create(outDst)

	switch outType {
	case "image/jpeg":
		err = jpeg.Encode(out, dstImg, nil)
	case "image/png":
		err = png.Encode(out, dstImg)
	case "image/gif":
		err = gif.Encode(out, dstImg, nil)
	default:
		err = png.Encode(out, dstImg)
	}

	if err != nil {
		log.Fatalf("Error encoding image: %s\n", err)
	}
	out.Close()
}

func checkFileSize(c *gin.Context, size int64) bool {
	if size > MaxSize {
		c.JSON(413, gin.H{
			"message": "File too large",
		})
		return true
	}
	return false
}

func GetImageById(c *gin.Context) {
	param, err := strconv.ParseInt(c.Param("imageId"), 10, 32)

	if err != nil {
		log.Fatalf("Error parsing image id: %s\n", err)
	}

	imageId := int32(param)
	requestImg, err := db.New(db.Pool()).GetImageBasedOnId(c, imageId)
	switch {
	case err == sql.ErrNoRows || requestImg.Md5 == "" || requestImg.Sha1 == "":
		c.JSON(404, gin.H{
			"message": "Image not found",
		})
	default:
		c.File(requestImg.Path)
	}
}

func ServeThumbnail(c *gin.Context) {
	file, _ := c.FormFile("thumbnail")
	if checkFileSize(c, file.Size) {
		return
	}

	width, _ := strconv.Atoi(c.PostForm("width"))
	height, _ := strconv.Atoi(c.PostForm("height"))
	outType := c.PostForm("outType")
	thumbnailType := c.PostForm("thumbnailType")
	description := c.PostForm("description")
	fileData, _ := file.Open()

	switch outType {
	case "image/jpeg", "image/png", "image/gif":
	default:
		outType = "image/png"
	}
	filename := newFileName(outType)

	dst := "server/" + thumbnailType + "/" + filename
	ResizeImage(fileData, width, height, outType, dst)
	thumbnailFile, _ := os.Open(dst)
	
	md5Hash, sha1Hash, err := generateHashes(thumbnailFile)
	if err != nil {
		log.Fatalf("Error generating hashes: %s\n", err)
	}
	thumbnailFile.Seek(0, io.SeekStart)

	insertId, err := db.New(db.Pool()).InsertImage(c, db.InsertImageParams{
		Md5:  md5Hash,
		Sha1: sha1Hash,
		Path: dst,
		Name: sql.NullString{
			String: filename,
			Valid:  true,
		},
		Description: sql.NullString{
			String: description,
			Valid:  true,
		},
	})
	if err != nil {
		log.Fatalf("Error inserting image: %s\n", err)
	}

	err = db.New(db.Pool()).DeleteTempImage(c, insertId)
	if err != nil {
		log.Fatalf("Error deleting temp image: %s\n", err)
	}
	
	c.File(dst)
}

func SubmitImages(c *gin.Context) {
	var submitImages []Image

	if err := c.BindJSON(&submitImages); err != nil {
		log.Fatalf("Error parsing JSON: %s\n", err)
	}

	for _, submit := range submitImages {
		err := db.New(db.Pool()).DeleteTempImage(c, submit.Id)
		if err != nil {
			log.Fatalf("Error deleting temp image: %s\n", err)
		}
	}

	c.JSON(200, gin.H{
		"message": "Submit successful",
	})
}

func CleanImages(c *gin.Context) {
	deletedRows, err := db.New(db.Pool()).ClearTempImages(c)
	if err != nil {
		log.Fatalf("Error clearing temp images: %s\n", err)
	}
	for _, row := range deletedRows {
		err = db.New(db.Pool()).DeleteImage(c, row)
		if err != nil {
			log.Fatalf("Error deleting image: %s\n", err)
		}
	}
}

func ReceiveImages(c *gin.Context) {
	form, _ := c.MultipartForm()
	description := c.PostForm("description")
	files := form.File["upload[]"]

	for _, file := range files {
		if checkFileSize(c, file.Size) {
			continue
		}
		fileData, _ := file.Open()

		//checking if file is an image (jpg, png, gif)
		fileType, imgErr := getImageType(fileData)
		if imgErr != nil {
			log.Fatalf("Error getting image type: %s\n", imgErr)
		}
		ok := detectImageType(fileType)
		if !ok {
			c.JSON(415, gin.H{
				"message": "Unsupported media type",
			})
			continue
		}

		//generating hash
		md5Hash, sha1Hash, err := generateHashes(fileData)
		if err != nil {
			log.Fatalf("Error generating hashes: %s\n", err)
		}
		fileData.Seek(0, io.SeekStart)

		//check if the file exist in the database
		peekRow, err := db.New(db.Pool()).GetImageBasedOnHash(c, db.GetImageBasedOnHashParams{
			Md5:  md5Hash,
			Sha1: sha1Hash,
		})

		switch {
		case err == sql.ErrNoRows || len(peekRow.Md5) == 0 || len(peekRow.Sha1) == 0:
			//saving file to the server
			filename := newFileName(fileType)
			dst := "server/book_contents/" + filename

			err = c.SaveUploadedFile(file, dst)
			if err != nil {
				log.Fatalf("Error saving file: %s\n", err)
			}

			//inserting image to the database
			imageId, err := db.New(db.Pool()).InsertImage(c, db.InsertImageParams{
				Md5:        md5Hash,
				Sha1:        sha1Hash,
				Path:        dst,
				Name:        sql.NullString{
					String: filename,
					Valid:  true,
				},
				Description: sql.NullString{
					String: description,
					Valid:  true,
				},
			})
			if err != nil {
				log.Fatalf("Error inserting image: %s\n", err)
			}

			//building the return message (may discard some field)
			c.JSON(200, Image{
				Id: imageId,
				Filename: filename,
				URL: c.Request.Host + "/images/" + strconv.FormatInt(int64(imageId), 10),
			})
		default:
			c.JSON(400, gin.H{
				"message": "File already exist",
				"Id": peekRow.ID,
				"URL": c.Request.Host + "/images/" + strconv.FormatInt(int64(peekRow.ID), 10),
			})
		}
	}
}

