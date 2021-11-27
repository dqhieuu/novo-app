package server

import (
	"context"
	"database/sql"
	"encoding/hex"
	"github.com/dqhieuu/novo-app/db"
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestGeneratePasswordHash(t *testing.T) {
	_, err := GeneratePasswordHash("test123")
	assert.Nil(t, err)
}

func TestEqualPasswords(t *testing.T) {
	tested := "test1234"
	hash, err := GeneratePasswordHash(tested)
	if err != nil {
		t.Fatal(err)
	}

	assert.True(t, EqualPasswords(hash, []byte(tested)))
}

func TestCreateAccount(t *testing.T) {
	db.Init()
	ctx := context.Background()
	queries := db.New(db.Pool())
	defer db.Close()

	username, password, email := "testuser", "secretpw", "user@atest.com"

	_, _, err := RegisterAccount(username, password, email)
	if err != nil {
		t.Fatal(err)
	}

	defer func() {
		err := DeleteAccount(username)
		if err != nil {
			t.Fatal(err)
		}
	}()

	user, err := queries.UserByUsernameOrEmail(ctx, sql.NullString{
		String: username,
		Valid:  true,
	})
	if err != nil {
		t.Fatal(err)
	}

	assert.Equal(t, user.UserName.String, username, "Compare username.")

	passwordHash, err := hex.DecodeString(user.Password.String)
	if err != nil {
		t.Fatal(err)
	}
	assert.True(t, EqualPasswords(passwordHash, []byte(password)), "Compare password.")

	assert.Equal(t, user.Email, email, "Compare email.")

	if err != nil {
		t.Fatal(err)
	}
}
