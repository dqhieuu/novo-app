// Code generated by sqlc. DO NOT EDIT.

package db

import (
	"database/sql"
	"time"
)

type BookAuthor struct {
	ID            int32          `json:"id"`
	Name          string         `json:"name"`
	Aliases       sql.NullString `json:"aliases"`
	Description   sql.NullString `json:"description"`
	AvatarImageID sql.NullInt32  `json:"avatarImageID"`
	BookAuthorTsv sql.NullString `json:"bookAuthorTsv"`
}

type BookChapter struct {
	ID            int32          `json:"id"`
	DateCreated   time.Time      `json:"dateCreated"`
	ChapterNumber float64        `json:"chapterNumber"`
	Name          sql.NullString `json:"name"`
	TextContent   sql.NullString `json:"textContent"`
	Type          string         `json:"type"`
	BookGroupID   int32          `json:"bookGroupID"`
	OwnerID       int32          `json:"ownerID"`
}

type BookChapterImage struct {
	BookChapterID int32 `json:"bookChapterID"`
	ImageID       int32 `json:"imageID"`
	Rank          int32 `json:"rank"`
}

type BookChapterView struct {
	Count         sql.NullInt32 `json:"count"`
	ViewDate      time.Time     `json:"viewDate"`
	BookChapterID int32         `json:"bookChapterID"`
}

type BookComment struct {
	ID            int32         `json:"id"`
	Content       string        `json:"content"`
	UserID        int32         `json:"userID"`
	BookGroupID   int32         `json:"bookGroupID"`
	BookChapterID sql.NullInt32 `json:"bookChapterID"`
	PostedTime    time.Time     `json:"postedTime"`
}

type BookGroup struct {
	ID                int32          `json:"id"`
	Title             string         `json:"title"`
	Aliases           sql.NullString `json:"aliases"`
	Description       sql.NullString `json:"description"`
	DateCreated       sql.NullTime   `json:"dateCreated"`
	OwnerID           int32          `json:"ownerID"`
	PrimaryCoverArtID sql.NullInt32  `json:"primaryCoverArtID"`
	BookGroupTsv      interface{}    `json:"bookGroupTsv"`
}

type BookGroupAltTitle struct {
	Title  string `json:"title"`
	BookID int32  `json:"bookID"`
}

type BookGroupArt struct {
	BookGroupID int32 `json:"bookGroupID"`
	ImageID     int32 `json:"imageID"`
}

type BookGroupAuthor struct {
	BookGroupID  int32 `json:"bookGroupID"`
	BookAuthorID int32 `json:"bookAuthorID"`
}

type BookGroupGenre struct {
	BookGroupID int32 `json:"bookGroupID"`
	GenreID     int32 `json:"genreID"`
}

type BookGroupLike struct {
	Point       int32 `json:"point"`
	UserID      int32 `json:"userID"`
	BookGroupID int32 `json:"bookGroupID"`
}

type Genre struct {
	ID          int32          `json:"id"`
	Name        string         `json:"name"`
	Description sql.NullString `json:"description"`
	ImageID     sql.NullInt32  `json:"imageID"`
}

type Image struct {
	ID          int32          `json:"id"`
	Md5         string         `json:"md5"`
	Sha1        string         `json:"sha1"`
	Path        string         `json:"path"`
	Name        sql.NullString `json:"name"`
	Description sql.NullString `json:"description"`
}

type Role struct {
	ID          int32          `json:"id"`
	Name        string         `json:"name"`
	Description sql.NullString `json:"description"`
}

type RolePermission struct {
	Module string `json:"module"`
	Action string `json:"action"`
	RoleID int32  `json:"roleID"`
}

type TempImage struct {
	ImageID     int32     `json:"imageID"`
	DateCreated time.Time `json:"dateCreated"`
}

type User struct {
	ID            int32          `json:"id"`
	DateCreated   time.Time      `json:"dateCreated"`
	UserName      sql.NullString `json:"userName"`
	Password      sql.NullString `json:"password"`
	Email         string         `json:"email"`
	Summary       sql.NullString `json:"summary"`
	AvatarImageID sql.NullInt32  `json:"avatarImageID"`
	RoleID        int32          `json:"roleID"`
	FavoriteList  sql.NullString `json:"favoriteList"`
}
