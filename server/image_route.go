package server

import (
	"bytes"
	"context"
	"crypto/md5"
	"crypto/sha1"
	"database/sql"
	"encoding/hex"
	"errors"
	"fmt"
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
	"path/filepath"
	//"encoding/json"
	//"github.com/dqhieuu/novo-app/db"
	"github.com/disintegration/imaging"
	"github.com/google/uuid"
)

const MaxSize = 1024 * 1024 * 10
const RootFolder = "static/images"

type ResizeImageParams struct {
	InType  string `json:"in_type"`
	OutType string `json:"out_type"`
	OutDst  string `json:"out_dst"`
	Width   int    `json:"width"`
	Height  int    `json:"height"`
}

func minInt(a int, b int) int {
	if a > b {
		return b
	}
	return a
}

func checkFileDir(path string, rootFolder string) (string, string, error) {
	dir := filepath.Dir(path)
	rootDir, err := os.Getwd()
	if err != nil {
		return "", "", errors.New("error getting root directory: " + err.Error())
	}
	if dir == "." {
		err = os.MkdirAll(rootDir+"/"+rootFolder, os.ModePerm)
		if err != nil {
			return "", "", errors.New("error checking directory: " + err.Error())
		}
		return rootDir + "/" + rootFolder + "/" + path, rootDir + "/" + rootFolder + "/" + dir, nil
	}
	err = os.MkdirAll(rootDir+"/"+rootFolder+"/"+dir, os.ModePerm)
	if err != nil {
		return "", "", errors.New("error checking directory: " + err.Error())
	}
	return rootDir + "/" + rootFolder + "/" + path, rootDir + "/" + rootFolder + "/" + dir, nil
}

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

func GetImageResolution(filestream multipart.File) (int, int, error) {
	resolution, _, err := image.DecodeConfig(filestream)
	if err != nil {
		return -1, -1, errors.New("error getting image resolution: " + err.Error())
	}
	_, err = filestream.Seek(0, io.SeekStart)
	if err != nil {
		return -1, -1, errors.New("error resetting file pointer: " + err.Error())
	}
	return resolution.Width, resolution.Height, nil
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
		err = jpeg.Encode(out, dstImg, nil)
	}

	if err != nil {
		return err
	}
	err = out.Close()
	if err != nil {
		return err
	}
	_, err = fileStream.Seek(0, io.SeekStart)
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

func GenerateThumbnail(path string, size int, filetype *string) (string, error) {
	//log.Println(*filetype)
	fullPath, dirPath, err := checkFileDir(path, RootFolder)
	if err != nil {
		return "", errors.New("error checking directory: " + err.Error())
	}
	filestream, err := os.Open(fullPath)
	if err != nil {
		return "", errors.New("error opening file: " + err.Error())
	}

	srcType, err := getImageType(filestream)
	if err != nil {
		return "", errors.New("error getting source file type: " + err.Error())
	}

	resolution, _, err := image.DecodeConfig(filestream)
	if err != nil {
		return "", errors.New("error getting resolution: " + err.Error())
	}
	_, err = filestream.Seek(0, io.SeekStart)
	if err != nil {
		return "", errors.New("error resetting file pointer: " + err.Error())
	}

	width := minInt(size, resolution.Width)
	outType := ""
	if filetype == nil {
		outType = srcType
	} else {
		outType = *filetype
	}

	extension := ""
	switch outType {
	case "image/jpeg":
		extension = ".jpg"
	case "image/png":
		extension = ".png"
	case "image/gif":
		extension = ".gif"
	default:
		extension = ".jpg"
	}
	thumbFileName := fmt.Sprintf("%s.%d%s", filepath.Base(path), size, extension)
	outDst := fmt.Sprintf("%s/%s", dirPath, thumbFileName)

	err = ResizeImage(filestream, ResizeImageParams{
		InType:  srcType,
		OutType: outType,
		OutDst:  outDst,
		Width:   width,
		Height:  0,
	})

	if err != nil {
		return "", errors.New("error resizing image: " + err.Error())
	}

	return filepath.Dir(path) + "/" + thumbFileName, nil
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

func SaveImageFromStream(filestream multipart.File, location string, fileNameNoExt string, description string) (int32, string, error) {
	ctx := context.Background()
	queries := db.New(db.Pool())

	_, dirPath, err := checkFileDir(location+"/"+fileNameNoExt, RootFolder)
	if err != nil {
		return -1, "", errors.New("error getting actual file path: " + err.Error())
	}

	fileType, err := getImageType(filestream)
	if err != nil {
		return -1, "", errors.New("error getting image type: " + err.Error())
	}

	ok := detectImageType(fileType)
	if !ok {
		return -1, "", errors.New("unsupported media type")
	}

	md5Hash, sha1Hash, err := generateHashes(filestream)
	if err != nil {
		return -1, "", errors.New("error generating hash: " + err.Error())
	}
	_, err = filestream.Seek(0, io.SeekStart)
	if err != nil {
		return -1, "", errors.New("error resetting file pointer: " + err.Error())
	}

	//check if the file exist in the database
	check, err := queries.CheckImageExistsByHash(ctx, db.CheckImageExistsByHashParams{
		Md5:  md5Hash,
		Sha1: sha1Hash,
	})
	if err != nil {
		return -1, "", errors.New("internal error: " + err.Error())
	}
	if check {
		peekRow, err := queries.GetImageBasedOnHash(ctx, db.GetImageBasedOnHashParams{
			Md5:  md5Hash,
			Sha1: sha1Hash,
		})
		if err != nil {
			return -1, "", errors.New("internal error: " + err.Error())
		}
		return peekRow.ID, peekRow.Path, nil
	} else {
		//saving file to the server
		extension := ""
		switch fileType {
		case "image/jpeg":
			extension = ".jpg"
		case "image/png":
			extension = ".png"
		case "image/gif":
			extension = ".gif"
		}
		dst := location + "/" + fileNameNoExt + extension

		//err = c.SaveUploadedFile(file, dst)
		saveFileStream, err := os.Create(dirPath + "/" + fileNameNoExt + extension)
		if err != nil {
			return -1, "", errors.New("error creating new file: " + err.Error())
		}
		_, err = io.Copy(saveFileStream, filestream)
		if err != nil {
			return -1, "", errors.New("error copying file: " + err.Error())
		}
		err = saveFileStream.Close()
		if err != nil {
			return -1, "", errors.New("error closing save file stream: " + err.Error())
		}

		//inserting image to the database
		imageId, err := queries.InsertImage(ctx, db.InsertImageParams{
			Md5:  md5Hash,
			Sha1: sha1Hash,
			Path: dst,
			Name: sql.NullString{
				String: fileNameNoExt + extension,
				Valid:  true,
			},
			Description: sql.NullString{
				String: description,
				Valid:  true,
			},
		})
		if err != nil {
			return -1, "", errors.New("error inserting image into database: " + err.Error())
		}

		return imageId, dst, nil
	}
}

func SaveImageFromUrl(fileUrl string, location string, fileNameNoExt string, description string) (int32, error) {
	ctx := context.Background()
	queries := db.New(db.Pool())

	_, dirPath, err := checkFileDir(location+"/"+fileNameNoExt, RootFolder)
	if err != nil {
		return -1, errors.New("error getting actual file path: " + err.Error())
	}

	response, err := http.Get(fileUrl)
	if err != nil {
		return -1, errors.New("error getting http response: " + err.Error())
	}

	bodyData, err := ioutil.ReadAll(response.Body)
	response.Body = ioutil.NopCloser(bytes.NewBuffer(bodyData))

	md5Hash, sha1Hash, err := generateHashes(response.Body)
	if err != nil {
		return -1, errors.New("error generating hash")
	}

	check, err := queries.CheckImageExistsByHash(ctx, db.CheckImageExistsByHashParams{
		Md5:  md5Hash,
		Sha1: sha1Hash,
	})
	if err != nil {
		return -1, errors.New("internal error: " + err.Error())
	}
	if check {
		peekRow, err := queries.GetImageBasedOnHash(ctx, db.GetImageBasedOnHashParams{
			Md5:  md5Hash,
			Sha1: sha1Hash,
		})
		if err != nil {
			return -1, errors.New("internal error: " + err.Error())
		}
		return peekRow.ID, nil
	} else {
		imageType := http.DetectContentType(bodyData)
		extension := ""
		switch imageType {
		case "image/jpeg":
			extension = ".jpg"
		case "image/png":
			extension = ".png"
		case "image/gif":
			extension = ".gif"
		}
		dst := location + "/" + fileNameNoExt + extension
		response.Body = ioutil.NopCloser(bytes.NewBuffer(bodyData))

		saveFile, err := os.Create(dirPath + "/" + fileNameNoExt + extension)
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
				String: dst,
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
	}
}

// Đừng để ý bên dưới này, 2 hàm này chỉ để test

func TryOutsideTest() {
	_, _, dst, absPath, err := CreateImage(400, 600)
	if err != nil {
		log.Fatalf("Error creating test image: %s\n", err)
	}

	outType := "image/png"

	newDst, err := GenerateThumbnail(dst, 300, &outType)
	if err != nil {
		log.Fatalf("Error generating thumbnail: %s\n", err)
	}
	log.Println(newDst)

	defer func() {
		err = os.Remove(absPath)
		if err != nil {
			log.Fatalf("Error deleting test file: %s\n", err)
		}
	}()
}

func CheckImageExistById(id int32) (bool, error) {
	ctx := context.Background()
	queries := db.New(db.Pool())
	result, err := queries.CheckImageExistById(ctx, id)
	if err != nil {
		return false, err
	}
	return result, nil
}

func ImagesByBookChapter(bookChapterId int32) (*[]string, error) {
	ctx := context.Background()
	queries := db.New(db.Pool())
	images, err := queries.ImagesByBookChapter(ctx, bookChapterId)
	if err != nil {
		return nil, err
	}
	return &images, nil
}
