package server

import (
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

//func TestCreateAccount(t *testing.T) {
//	db.Init()
//	ctx := context.Background()
//	queries := db.New(db.Pool())
//	defer db.Pool().Close()
//
//	username, password, email := "testuser", "secretpw", "user@atest.com"
//	testRole := "Test"
//
//	_, err := queries.InsertNewRole(ctx, db.InsertNewRoleParams{
//		Name: testRole,
//	})
//	if err != nil {
//		t.Fatal(err)
//	}
//	defer func() {
//		err := queries.DeleteRole(ctx, testRole)
//		if err != nil {
//			t.Fatal(err)
//		}
//	}()
//
//	err = CreateAccount(username, password, email, testRole)
//	if err != nil {
//		t.Fatal(err)
//	}
//
//	defer func() {
//		err := DeleteAccount(username)
//		if err != nil {
//			t.Fatal(err)
//		}
//	}()
//
//	user, err := queries.UserByUsernameOrEmail(ctx, username)
//	if err != nil {
//		t.Fatal(err)
//	}
//
//	assert.Equal(t, user.Username, username, "Compare username.")
//
//	passwordHash, err := hex.DecodeString(user.Password)
//	if err != nil {
//		t.Fatal(err)
//	}
//	assert.True(t, EqualPasswords(passwordHash, []byte(password)), "Compare password.")
//
//	assert.Equal(t, user.Email, email, "Compare email.")
//
//	if err != nil {
//		t.Fatal(err)
//	}
//}
