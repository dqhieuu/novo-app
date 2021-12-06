import React from 'react';
import Link from 'next/link';
export default function UserPage() {
  return (
    <div>
      <div className="container">
        <div
          className="row"
          style={{
            background: '#f3f3f3',
            borderRadius: '5px',
          }}
        >
          <div className="col-3 p-5">
            <img
              className="rounded-circle"
              src="https://www.niadd.com/files/images/def_logo.svg"
              alt="User avatar"
              style={{ border: '1px solid black' }}
            ></img>
          </div>
          <div className="col-9 p-5">
            <h3>Nguyễn Quang Đại Dương</h3>
            <p style={{ fontStyle: 'italic' }}>
              "One day you'll leave this world behind, so
              live a life you will remember!"
            </p>
          </div>
        </div>
        <div
          className="row mt-3"
          style={{
            background: '#f3f3f3',
            borderRadius: '5px',
          }}
        >
          <div className="col-9">
            <div className="p-3">
              <div className="d-flex justify-content-between">
                <p className="h5">Truyện đã đăng</p>
                <Link href="/manageMangaUpload">
                  <button
                    type="button"
                    className="btn btn-link"
                    style={{ textDecoration: 'none' }}
                  >
                    More
                  </button>
                </Link>
              </div>
              <hr></hr>
              <div className="d-flex flex-column align-items-center">
                <img
                  src="https://www.niadd.com/files/images/default/no_post.png"
                  width="200px"
                ></img>
                <p style={{ color: '#9aa6b8' }}>
                  Bạn chưa đăng truyện nào!
                </p>
              </div>
            </div>
            <div className="mt-3 p-3">
              <div className="d-flex justify-content-between">
                <p className="h5">Truyện đã đọc</p>
                <button
                  type="button"
                  className="btn btn-link"
                  style={{ textDecoration: 'none' }}
                >
                  More
                </button>
              </div>
              <hr></hr>
              <div className="d-flex flex-column align-items-center">
                <img
                  src="https://www.niadd.com/files/images/default/no_book.png"
                  width="200px"
                ></img>
                <p style={{ color: '#9aa6b8' }}>
                  Bạn chưa đọc truyện nào!
                </p>
              </div>
            </div>
            <div className="mt-3 p-3">
              <div className="d-flex justify-content-between">
                <p className="h5">Truyện đã thích</p>
                <button
                  type="button"
                  className="btn btn-link"
                  style={{ textDecoration: 'none' }}
                >
                  More
                </button>
              </div>
              <hr></hr>
              <div className="d-flex flex-column align-items-center">
                <img
                  src="https://www.niadd.com/files/images/default/no_book.png"
                  width="200px"
                ></img>
                <p style={{ color: '#9aa6b8' }}>
                  Bạn chưa thích nào!
                </p>
              </div>
            </div>
          </div>
          <div className="mt-3 col-3">
            <div className="">
              <p>Username: Đào Quang Hiếu </p>
              <p>Email: abcxyz@gmail.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
