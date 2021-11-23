package server

import (
	"bytes"
	"context"
	"crypto/md5"
	"crypto/sha1"
	"database/sql"
	"encoding/hex"
	"errors"
	"github.com/dqhieuu/novo-app/db"
	"image"
	"image/gif"
	"image/jpeg"
	"image/png"
	"io"
	"io/ioutil"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	//"encoding/json"
	//"github.com/dqhieuu/novo-app/db"
	"github.com/disintegration/imaging"
	"github.com/google/uuid"
)

const MaxSize = 1024 * 1024 * 10

func newFileName(fileType string) string {
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

func getImageType(fileStream multipart.File) (string, error) {
	buffer := make([]byte, 512)
	if _, err := fileStream.Read(buffer); err != nil {
		return "", err
	}
	imageType := http.DetectContentType(buffer)
	_, err := fileStream.Seek(0, io.SeekStart)
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

func generateHashes(fileStream io.Reader) (string, string, error) {
	var sha1Stream bytes.Buffer
	md5Stream := io.TeeReader(fileStream, &sha1Stream)

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

func ResizeImage(fileStream multipart.File, params ResizeImageParams) error {
	var srcImg image.Image
	var err error
	switch params.InType {
	case "image/jpeg":
		srcImg, err = jpeg.Decode(fileStream)
	case "image/png":
		srcImg, err = png.Decode(fileStream)
	case "image/gif":
		srcImg, err = gif.Decode(fileStream)
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

func GetImageById(imageId int32) (string, error) {
	ctx := context.Background()
	queries := db.New(db.Pool())
	requestImg, err := queries.GetImageBasedOnId(ctx, imageId)
	switch {
	case err == sql.ErrNoRows || requestImg.Md5 == "" || requestImg.Sha1 == "":
		//c.JSON(404, gin.H{
		//	"message": "Image not found",
		//})
		return "", errors.New("image does not exist")
	default:
		//c.File(requestImg.Path)
		return requestImg.Path, nil
	}
}

func ServeThumbnail(params ServeThumbnailParams) (string, int32, error) {
	ctx := context.Background()
	queries := db.New(db.Pool())
	dirErr := os.MkdirAll("images/"+params.ThumbnailType, os.ModePerm)
	if dirErr != nil {
		log.Printf("Error creating new directory: %s\n", dirErr)
		return "", -1, dirErr
	}

	if checkFileSize(params.Size) {
		//c.JSON(413, gin.H{
		//	"message": "File too large",
		//})
		return "", -1, errors.New("file too large")
	}
	fileData := params.File

	fileType, err := getImageType(fileData)
	if err != nil {
		return "", -1, errors.New("error getting image type: " + err.Error())
	}
	ok := detectImageType(fileType)
	if !ok {
		//c.JSON(415, gin.H{
		//	"message": "Unsupported media type",
		//})
		return "", -1, errors.New("unsupported media type")
	}

	//default output type is png
	switch params.ResizeParams.OutType {
	case "image/jpeg", "image/png", "image/gif":
	default:
		params.ResizeParams.OutType = "image/png"
	}

	//resize the image and save it to dst
	filename := newFileName(params.ResizeParams.OutType)
	dst := "images/" + params.ThumbnailType + "/" + filename
	params.ResizeParams.OutDst = dst
	err = ResizeImage(fileData, params.ResizeParams)
	if err != nil {
		return "", -1, errors.New("error resizing image: " + err.Error())
	}

	err = fileData.Close()
	if err != nil {
		return "", -1, errors.New("error closing file stream: " + err.Error())
	}

	// open the file again to calculate hashes
	thumbnailFile, err := os.Open(dst)
	if err != nil {
		return "", -1, errors.New("error creating destination path: " + err.Error())
	}

	// calculate hashes
	md5Hash, sha1Hash, err := generateHashes(thumbnailFile)
	if err != nil {
		return "", -1, errors.New("error generating hashes: " + err.Error())
	}

	err = thumbnailFile.Close()
	if err != nil {
		return "", -1, errors.New("error closing thumbnail file: " + err.Error())
	}

	peekRow, err := queries.GetImageBasedOnHash(ctx, db.GetImageBasedOnHashParams{
		Md5:  md5Hash,
		Sha1: sha1Hash,
	})

	switch {
	case err == sql.ErrNoRows || len(peekRow.Md5) == 0 || len(peekRow.Sha1) == 0:
		//inserting the image into the database
		insertId, err := queries.InsertImage(ctx, db.InsertImageParams{
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
			return "", -1, errors.New("error inserting image: " + err.Error())
		}

		//delete the temp image due to trigger
		err = queries.DeleteTempImage(ctx, insertId)
		if err != nil {
			return "", -1, errors.New("error deleting temp image: " + err.Error())
		}
		//send back the file for front-end uses
		//c.File(dst)
		return dst, insertId, nil
	default:
		err = os.Remove(dst)
		if err != nil {
			return "", -1, errors.New("error removing duplicate file: " + err.Error())
		}
		return peekRow.Path, peekRow.ID, errors.New("image already exists")
	}
}

func SubmitImages(submitImages []int32) error {
	ctx := context.Background()
	queries := db.New(db.Pool())
	for _, submitId := range submitImages {
		err := queries.DeleteTempImage(ctx, submitId)
		if err != nil {
			return errors.New("error deleting temp image: " + err.Error())
		}
	}

	//c.JSON(200, gin.H{
	//	"message": "Submit successful",
	//})
	return nil
}

func CleanImages() error {
	ctx := context.Background()
	queries := db.New(db.Pool())
	deletedRows, err := queries.ClearTempImages(ctx)
	if err != nil {
		return errors.New("error clearing temp images: " + err.Error())
	}
	for _, row := range deletedRows {
		err = queries.DeleteImage(ctx, row)
		if err != nil {
			return errors.New("error deleting image: " + err.Error())
		}
	}
	return nil
}

func ProcessImages(params ReceiveImagesParams) []ImageStatus {
	ctx := context.Background()
	queries := db.New(db.Pool())
	files := params.Files
	var status []ImageStatus
	dirErr := os.MkdirAll("images/book_contents", os.ModePerm)
	if dirErr != nil {
		log.Printf("Error creating new directory: %s\n", dirErr)
		return status
	}

	for _, file := range files {
		if checkFileSize(file.Size) {
			//c.JSON(413, gin.H{
			//	"message": "File too large",
			//})
			status = append(status, ImageStatus{
				Id:  -1,
				Err: errors.New("file too large"),
			})
			continue
		}

		//checking if file is an image (jpg, png, gif)
		fileType, err := getImageType(file.Data)
		if err != nil {
			status = append(status, ImageStatus{
				Id:  -1,
				Err: errors.New("error getting image type: " + err.Error()),
			})
			continue
		}
		ok := detectImageType(fileType)
		if !ok {
			status = append(status, ImageStatus{
				Id:  -1,
				Err: errors.New("unsupported media type"),
			})
			continue
		}

		//generating hash
		md5Hash, sha1Hash, err := generateHashes(file.Data)
		if err != nil {
			status = append(status, ImageStatus{
				Id:  -1,
				Err: errors.New("error generating hash: " + err.Error()),
			})
			continue
		}
		_, err = file.Data.Seek(0, io.SeekStart)
		if err != nil {
			status = append(status, ImageStatus{
				Id:  -1,
				Err: errors.New("error resetting file pointer: " + err.Error()),
			})
			continue
		}

		//check if the file exist in the database
		peekRow, err := queries.GetImageBasedOnHash(ctx, db.GetImageBasedOnHashParams{
			Md5:  md5Hash,
			Sha1: sha1Hash,
		})

		switch {
		case err == sql.ErrNoRows || len(peekRow.Md5) == 0 || len(peekRow.Sha1) == 0:
			//saving file to the server
			filename := newFileName(fileType)
			dst := "images/book_contents/" + filename

			//err = c.SaveUploadedFile(file, dst)
			saveFileStream, err := os.Create(dst)
			if err != nil {
				status = append(status, ImageStatus{
					Id:  -1,
					Err: errors.New("error creating new file: " + err.Error()),
				})
				continue
			}
			_, err = io.Copy(saveFileStream, file.Data)
			if err != nil {
				status = append(status, ImageStatus{
					Id:  -1,
					Err: errors.New("error copying file: " + err.Error()),
				})
				continue
			}
			err = saveFileStream.Close()
			if err != nil {
				status = append(status, ImageStatus{
					Id:  -1,
					Err: errors.New("error closing save file stream: " + err.Error()),
				})
				continue
			}

			//inserting image to the database
			imageId, err := queries.InsertImage(ctx, db.InsertImageParams{
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
				status = append(status, ImageStatus{
					Id:  -1,
					Err: errors.New("error inserting image into database: " + err.Error()),
				})
				continue
			}

			status = append(status, ImageStatus{
				Id:  imageId,
				Err: nil,
			})

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
			status = append(status, ImageStatus{
				Id:  peekRow.ID,
				Err: errors.New("image already exist"),
			})
		}
		err = file.Data.Close()
		if err != nil {
			status = append(status, ImageStatus{
				Id:  -1,
				Err: errors.New("error closing file stream: " + err.Error()),
			})
		}
	}
	return status
}

func ProcessImageByUrl(url string, description string) (int32, error) {
	ctx := context.Background()
	queries := db.New(db.Pool())

	response, err := http.Get(url)
	if err != nil {
		return -1, errors.New("error getting http response: " + err.Error())
	}

	dirErr := os.MkdirAll("images/url", os.ModePerm)
	if dirErr != nil {
		log.Printf("Error creating new directory: %s\n", dirErr)
		return -1, dirErr
	}

	bodyData, err := ioutil.ReadAll(response.Body)
	response.Body = ioutil.NopCloser(bytes.NewBuffer(bodyData))

	md5Hash, sha1Hash, err := generateHashes(response.Body)
	if err != nil {
		return -1, errors.New("error generating hash")
	}

	peekRow, err := queries.GetImageBasedOnHash(ctx, db.GetImageBasedOnHashParams{
		Md5:  md5Hash,
		Sha1: sha1Hash,
	})

	switch {
	case err == sql.ErrNoRows || len(peekRow.Md5) == 0 || len(peekRow.Sha1) == 0:
		imageType := http.DetectContentType(bodyData)
		filename := newFileName(imageType)
		dst := "images/url/" + filename
		response.Body = ioutil.NopCloser(bytes.NewBuffer(bodyData))

		saveFile, err := os.Create(dst)
		if err != nil {
			return -1, errors.New("error creating new file: " + err.Error())
		}

		defer func(saveFile *os.File) {
			err := saveFile.Close()
			if err != nil {
				log.Printf("Error closing new file: %s\n", err)
			}
		}(saveFile)

		_, err = io.Copy(saveFile, response.Body)
		if err != nil {
			return -1, errors.New("error saving file: " + err.Error())
		}

		imageId, err := queries.InsertImage(ctx, db.InsertImageParams{
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
			return -1, errors.New("error inserting image into database: " + err.Error())
		}

		return imageId, nil
	default:
		return peekRow.ID, errors.New("image already exists")
	}
}
