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
	//"encoding/json"
	//"github.com/dqhieuu/novo-app/db"
	"github.com/disintegration/imaging"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"log"
)

const MaxSize = 1024 * 1024 * 10

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
	_, err := f.Seek(0, io.SeekStart)
	if err != nil {
		return "", err
	}
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

func ResizeImage(f multipart.File, params ResizeImageParams) error {
	var srcImg image.Image
	var err error
	switch params.InType {
	case "image/jpeg":
		srcImg, err = jpeg.Decode(f)
	case "image/png":
		srcImg, err = png.Decode(f)
	case "image/gif":
		srcImg, err = gif.Decode(f)
	}

	if err != nil {
		return err
	}

	dstImg := imaging.Resize(srcImg, params.Width, params.Height, imaging.MitchellNetravali)

	out, err := os.Create(params.OutDst)
	if err != nil {
		return err
	}

	switch params.OutType {
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
		return err
	}
	err = out.Close()
	if err != nil {
		return err
	}
	return nil
}

func checkFileSize(size int64) bool {
	if size > MaxSize {
		return true
	}
	return false
}

func GetImageById(c *gin.Context, imageId int32) {
	requestImg, err := db.New(db.Pool()).GetImageBasedOnId(c, imageId)
	switch {
	case err == sql.ErrNoRows || requestImg.Md5 == "" || requestImg.Sha1 == "":
		//c.JSON(404, gin.H{
		//	"message": "Image not found",
		//})
	default:
		//c.File(requestImg.Path)
	}
}

func ServeThumbnail(c *gin.Context, params ServeThumnailParams) {
	file := params.File
	fileData, err := file.Open()
	if err != nil {
		log.Fatalf("Error getting file stream: %s\n", err)
	}
	if checkFileSize(file.Size) {
		//c.JSON(413, gin.H{
		//	"message": "File too large",
		//})
		return
	}

	fileType, err := getImageType(fileData)
	if err != nil {
		log.Fatalf("Error getting image type: %s\n", err)
	}
	ok := detectImageType(fileType)
	if !ok {
		//c.JSON(415, gin.H{
		//	"message": "Unsupported media type",
		//})
		return
	}

	//default output type is png
	switch params.ResizeParams.OutType {
	case "image/jpeg", "image/png", "image/gif":
	default:
		params.ResizeParams.OutType = "image/png"
	}

	//resize the image and save it to dst
	filename := newFileName(params.ResizeParams.OutType)
	dst := "server/images/" + params.ThumbnailType + "/" + filename
	err = ResizeImage(fileData, params.ResizeParams)
	if err != nil {
		log.Fatalf("Error resizing image: %s\n", err)
	}

	// open the file again to calculate hashes
	thumbnailFile, err := os.Open(dst)
	if err != nil {
		log.Fatalf("Error opening destination path: %s\n", err)
	}
	
	// calculate hashes
	md5Hash, sha1Hash, err := generateHashes(thumbnailFile)
	if err != nil {
		log.Fatalf("Error generating hashes: %s\n", err)
	}
	_, err = thumbnailFile.Seek(0, io.SeekStart)
	if err != nil {
		return
	}

	//inserting the image into the database
	insertId, err := db.New(db.Pool()).InsertImage(c, db.InsertImageParams{
		Md5:  md5Hash,
		Sha1: sha1Hash,
		Path: dst,
		Name: sql.NullString{
			String: filename,
			Valid:  true,
		},
		Description: sql.NullString{
			String: params.Description,
			Valid:  true,
		},
	})
	if err != nil {
		log.Fatalf("Error inserting image: %s\n", err)
	}

	//delete the temp image due to trigger
	err = db.New(db.Pool()).DeleteTempImage(c, insertId)
	if err != nil {
		log.Fatalf("Error deleting temp image: %s\n", err)
	}
	
	//send back the file for front-end uses
	//c.File(dst)
}

func SubmitImages(c *gin.Context, submitImages []Image) {
	for _, submit := range submitImages {
		err := db.New(db.Pool()).DeleteTempImage(c, submit.Id)
		if err != nil {
			log.Fatalf("Error deleting temp image: %s\n", err)
		}
	}

	//c.JSON(200, gin.H{
	//	"message": "Submit successful",
	//})
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

func ReceiveImages(c *gin.Context, params ReceiveImagesParams) {
	files := params.Files

	for _, file := range files {
		if checkFileSize(file.Size) {
			//c.JSON(413, gin.H{
			//	"message": "File too large",
			//})
			continue
		}
		fileData, err := file.Open()
		if err != nil {
			log.Fatalf("Error getting file stream: %s\n", err)
		}

		//checking if file is an image (jpg, png, gif)
		fileType, imgErr := getImageType(fileData)
		if imgErr != nil {
			log.Fatalf("Error getting image type: %s\n", imgErr)
		}
		ok := detectImageType(fileType)
		if !ok {
			//c.JSON(415, gin.H{
			//	"message": "Unsupported media type",
			//})
			continue
		}

		//generating hash
		md5Hash, sha1Hash, err := generateHashes(fileData)
		if err != nil {
			log.Fatalf("Error generating hashes: %s\n", err)
		}
		_, err = fileData.Seek(0, io.SeekStart)
		if err != nil {
			return
		}

		//check if the file exist in the database
		peekRow, err := db.New(db.Pool()).GetImageBasedOnHash(c, db.GetImageBasedOnHashParams{
			Md5:  md5Hash,
			Sha1: sha1Hash,
		})

		switch {
		case err == sql.ErrNoRows || len(peekRow.Md5) == 0 || len(peekRow.Sha1) == 0:
			//saving file to the server
			filename := newFileName(fileType)
			dst := "server/images/book_contents/" + filename

			err = c.SaveUploadedFile(file, dst)
			if err != nil {
				log.Fatalf("Error saving file: %s\n", err)
			}

			//inserting image to the database (_ is the imageId)
			_, err := db.New(db.Pool()).InsertImage(c, db.InsertImageParams{
				Md5:        md5Hash,
				Sha1:        sha1Hash,
				Path:        dst,
				Name:        sql.NullString{
					String: filename,
					Valid:  true,
				},
				Description: sql.NullString{
					String: params.Description,
					Valid:  true,
				},
			})
			if err != nil {
				log.Fatalf("Error inserting image: %s\n", err)
			}

			//building the return message (may discard some field)
			//c.JSON(200, Image{
			//	Id: imageId,
			//	Filename: filename,
			//	URL: c.Request.Host + "/images/" + strconv.FormatInt(int64(imageId), 10),
			//})
		default:
			//c.JSON(400, gin.H{
			//	"message": "File already exist",
			//	"Id": peekRow.ID,
			//	"URL": c.Request.Host + "/images/" + strconv.FormatInt(int64(peekRow.ID), 10),
			//})
		}
	}
}

