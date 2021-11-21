package server

import "mime/multipart"

type Image struct {
	Id       int32  `json:"id"`
	Filename string `json:"filename"`
	URL      string `json:"url"`
}

type ResizeImageParams struct {
	InType  string `json:"in_type"`
	OutType string `json:"out_type"`
	OutDst  string `json:"out_dst"`
	Width   int    `json:"width"`
	Height  int    `json:"height"`
}

type ServeThumnailParams struct {
	File          *multipart.FileHeader
	ResizeParams  ResizeImageParams
	Description   string
	ThumbnailType string
}

type ReceiveImagesParams struct {
	Files       []*multipart.FileHeader
	Description string
}
