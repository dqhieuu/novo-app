// Code generated by sqlc. DO NOT EDIT.

package db

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/jackc/pgtype"
)

type PermissionScope string

const (
	PermissionScopeNone PermissionScope = "none"
	PermissionScopeSelf PermissionScope = "self"
	PermissionScopeAll  PermissionScope = "all"
)

func (e *PermissionScope) Scan(src interface{}) error {
	switch s := src.(type) {
	case []byte:
		*e = PermissionScope(s)
	case string:
		*e = PermissionScope(s)
	default:
		return fmt.Errorf("unsupported scan type for PermissionScope: %T", src)
	}
	return nil
}

type BookAuthor struct {
	ID            int32          `json:"id"`
	Name          string         `json:"name"`
	Description   sql.NullString `json:"description"`
	AvatarImageID sql.NullInt32  `json:"avatar_image_id"`
}

type BookChapter struct {
	ID            int32          `json:"id"`
	DateCreated   time.Time      `json:"date_created"`
	ChapterNumber pgtype.Numeric `json:"chapter_number"`
	Description   sql.NullString `json:"description"`
	TextContext   sql.NullString `json:"text_context"`
	Type          string         `json:"type"`
	BookGroupID   int32          `json:"book_group_id"`
	OwnerID       int32          `json:"owner_id"`
}

type BookChapterImage struct {
	BookChapterID int32 `json:"book_chapter_id"`
	ImageID       int32 `json:"image_id"`
}

type BookChaptersView struct {
	Count         sql.NullInt32 `json:"count"`
	ViewDate      time.Time     `json:"view_date"`
	BookChapterID int32         `json:"book_chapter_id"`
}

type BookComment struct {
	Content       string        `json:"content"`
	UserID        int32         `json:"user_id"`
	BookGroupID   sql.NullInt32 `json:"book_group_id"`
	BookChapterID sql.NullInt32 `json:"book_chapter_id"`
}

type BookGroup struct {
	ID          int32          `json:"id"`
	Title       string         `json:"title"`
	Description sql.NullString `json:"description"`
	DateCreated sql.NullTime   `json:"date_created"`
	Ownerid     int32          `json:"ownerid"`
}

type BookGroupAltTitle struct {
	Title  string `json:"title"`
	BookID int32  `json:"book_id"`
}

type BookGroupArt struct {
	BookGroupID int32 `json:"book_group_id"`
	ImageID     int32 `json:"image_id"`
}

type BookGroupAuthor struct {
	BookGroupID  int32 `json:"book_group_id"`
	BookAuthorID int32 `json:"book_author_id"`
}

type BookGroupGenre struct {
	BookGroupID int32 `json:"book_group_id"`
	GenreID     int32 `json:"genre_id"`
}

type BookGroupLike struct {
	Point       int32 `json:"point"`
	UserID      int32 `json:"user_id"`
	BookGroupID int32 `json:"book_group_id"`
}

type Genre struct {
	ID          int32          `json:"id"`
	Name        string         `json:"name"`
	Description sql.NullString `json:"description"`
	ImageID     sql.NullInt32  `json:"image_id"`
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
	ID                   int32           `json:"id"`
	Name                 string          `json:"name"`
	Description          sql.NullString  `json:"description"`
	CanModifyRole        bool            `json:"can_modify_role"`
	CanModifyBookAuthor  bool            `json:"can_modify_book_author"`
	CanModifyBookGenre   bool            `json:"can_modify_book_genre"`
	CanModifyBookGroup   PermissionScope `json:"can_modify_book_group"`
	CanModifyBookChapter PermissionScope `json:"can_modify_book_chapter"`
	CanCreateComment     PermissionScope `json:"can_create_comment"`
	CanUpdateComment     PermissionScope `json:"can_update_comment"`
	CanDeleteComment     PermissionScope `json:"can_delete_comment"`
	CanModifyD           PermissionScope `json:"can_modify_d"`
}

type TempImage struct {
	ImageID     int32     `json:"image_id"`
	DateCreated time.Time `json:"date_created"`
}

type User struct {
	ID            int32          `json:"id"`
	DateCreated   time.Time      `json:"date_created"`
	UserName      sql.NullString `json:"user_name"`
	Password      sql.NullString `json:"password"`
	Email         string         `json:"email"`
	Summary       sql.NullString `json:"summary"`
	AvatarImageID sql.NullInt32  `json:"avatar_image_id"`
	RoleID        int32          `json:"role_id"`
	FavoriteList  sql.NullString `json:"favorite_list"`
}
