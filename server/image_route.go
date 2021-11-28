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
	"image/color"
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
	"strings"

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
		err = os.MkdirAll(rootDir + "/" + rootFolder, os.ModePerm)
		if err != nil {
			return "", "", errors.New("error checking directory: " + err.Error())
		}
		return rootDir + "/" + rootFolder + "/" + path, rootDir + "/" + rootFolder + "/" + dir,  nil
	}
	err = os.MkdirAll(rootDir + "/" + rootFolder + "/" + dir, os.ModePerm)
	if err != nil {
		return "", "", errors.New("error checking directory: " + err.Error())
	}
	return rootDir + "/" + rootFolder + "/" + path, rootDir + "/" + rootFolder + "/" + dir, nil
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
		err = png.Encode(out, dstImg)
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

func GenerateThumbnail(path string, size int, filetype *string) (string, error) {
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

	extension := filepath.Ext(path)
	orgFileName := strings.TrimSuffix(filepath.Base(path), extension)
	thumbFileName := fmt.Sprintf("%s-%d%s", orgFileName, size, extension)
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

func SaveImageFromStream(filestream multipart.File, location string, fileNameNoExt string, description string) (int32, string, error) {
	ctx := context.Background()
	queries := db.New(db.Pool())

	_, dirPath, err := checkFileDir(location + "/" + fileNameNoExt, RootFolder)
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
	peekRow, err := queries.GetImageBasedOnHash(ctx, db.GetImageBasedOnHashParams{
		Md5:  md5Hash,
		Sha1: sha1Hash,
	})

	switch {
	case err == sql.ErrNoRows || len(peekRow.Md5) == 0 || len(peekRow.Sha1) == 0:
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
			Md5:        md5Hash,
			Sha1:        sha1Hash,
			Path:        dst,
			Name:        sql.NullString{
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
	default:
		return -1, "", errors.New("image already exist")
	}
}

func SaveImageFromUrl(fileUrl string, location string, fileNameNoExt string, description string) (int32, error){
	ctx := context.Background()
	queries := db.New(db.Pool())

	_, dirPath, err := checkFileDir(location + "/" + fileNameNoExt, RootFolder)
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

	peekRow, err := queries.GetImageBasedOnHash(ctx, db.GetImageBasedOnHashParams{
		Md5:  md5Hash,
		Sha1: sha1Hash,
	})

	switch {
	case err == sql.ErrNoRows || len(peekRow.Md5) == 0 || len(peekRow.Sha1) == 0:
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
			Md5:         md5Hash,
			Sha1:        sha1Hash,
			Path:        dst,
			Name:        sql.NullString{
				String: dst,
				Valid: true,
			},
			Description: sql.NullString{
				String: description,
				Valid: true,
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

// Đừng để ý bên dưới này, 2 hàm này chỉ để test

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

