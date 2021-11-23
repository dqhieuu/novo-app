package server

import "mime/multipart"

type Image struct{
	Data multipart.File
	Size int64
}

type ResizeImageParams struct{
	InType string `json:"in_type"`
	OutType string `json:"out_type"`
	OutDst string `json:"out_dst"`
	Width int `json:"width"`
	Height int `json:"height"`
}

type ServeThumbnailParams struct{
	File multipart.File
	ResizeParams ResizeImageParams
	Size int64
	Description string
	ThumbnailType string
}

type ReceiveImagesParams struct{
	Files []Image
	Description string
}

type ImageStatus struct{
	Id int32
	Err error
}