import Head from "next/head";
import Link from "next/link";
import React from "react";

export default function Layout({ children }) {
  return (
    <div>
      <Head>
        <title>MangaReader</title>
      </Head>
      <nav className="navbar navbar-expand-sm navbar-light bg-light sticky-top ">
        <div className="container">
          <Link href="/" passHref>
            <a className="navbar-brand">Logo</a>
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Danh sách
                </a>
                <ul
                  className="dropdown-menu"
                  aria-labelledby="navbarDropdown"
                  style={{ width: "900px" }}
                >
                  <div className="container">
                    <div className="row">
                      <div
                        className="col-12 col-sm-12 col-md-12 col-lg-2"
                        style={{ borderRight: "1px solid grey" }}
                      >
                        <li>
                          <a className="dropdown-item" href="#">
                            Manga
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item" href="#">
                            Manhwa
                          </a>
                        </li>

                        <li>
                          <a className="dropdown-item" href="#">
                            Manhua
                          </a>
                        </li>

                        <li>
                          <a className="dropdown-item" href="#">
                            Comic
                          </a>
                        </li>
                      </div>
                      <div className="col-12 col-sm-12 col-md-12 col-lg-2">
                        <li>
                          <a className="dropdown-item" href="#">
                            Manga
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item" href="#">
                            Manhwa
                          </a>
                        </li>

                        <li>
                          <a className="dropdown-item" href="#">
                            Manhua
                          </a>
                        </li>

                        <li>
                          <a className="dropdown-item" href="#">
                            Comic
                          </a>
                        </li>
                      </div>
                      <div className="col-12 col-sm-12 col-md-12 col-lg-2">
                        <li>
                          <a className="dropdown-item" href="#">
                            Manga
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item" href="#">
                            Manhwa
                          </a>
                        </li>

                        <li>
                          <a className="dropdown-item" href="#">
                            Manhua
                          </a>
                        </li>

                        <li>
                          <a className="dropdown-item" href="#">
                            Comic
                          </a>
                        </li>
                      </div>
                      <div className="col-12 col-sm-12 col-md-12 col-lg-2">
                        <li>
                          <a className="dropdown-item" href="#">
                            Manga
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item" href="#">
                            Manhwa
                          </a>
                        </li>

                        <li>
                          <a className="dropdown-item" href="#">
                            Manhua
                          </a>
                        </li>

                        <li>
                          <a className="dropdown-item" href="#">
                            Comic
                          </a>
                        </li>
                      </div>
                      <div className="col-12 col-sm-12 col-md-12 col-lg-2">
                        <li>
                          <a className="dropdown-item" href="#">
                            Manga
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item" href="#">
                            Manhwa
                          </a>
                        </li>

                        <li>
                          <a className="dropdown-item" href="#">
                            Manhua
                          </a>
                        </li>

                        <li>
                          <a className="dropdown-item" href="#">
                            Comic
                          </a>
                        </li>
                      </div>
                      <div className="col-12 col-sm-12 col-md-12 col-lg-2">
                        <li>
                          <a className="dropdown-item" href="#">
                            Manga
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item" href="#">
                            Manhwa
                          </a>
                        </li>

                        <li>
                          <a className="dropdown-item" href="#">
                            Manhua
                          </a>
                        </li>

                        <li>
                          <a className="dropdown-item" href="#">
                            Comic
                          </a>
                        </li>
                      </div>
                    </div>
                  </div>
                </ul>
              </li>
              <li className="nav-item">
                <Link href="/hotManga" passHref>
                  <a className="nav-link">Truyện Hot</a>
                </Link>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  BXH
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  Donate
                </a>
              </li>
            </ul>
            <form className="d-flex">
              <input
                type="search"
                className="form-control me-2"
                placeholder="Tìm kiếm tại đây"
                aria-label="Search"
                style={{ width: "200px" }}
              />
              <button className="btn btn-primary me-2" type="submit">
                Search
              </button>
            </form>
            <a
              href="#"
              className="navbar-brand"
              data-bs-toggle="offcanvas"
              data-bs-target="#demo"
            >
              <img
                src="https://scontent.fhan2-4.fna.fbcdn.net/v/t39.30808-6/257555893_3026155144319210_1182420202567337895_n.jpg?_nc_cat=103&ccb=1-5&_nc_sid=09cbfe&_nc_ohc=qchqtSUBzsQAX8_0Znf&tn=vjAVAMjgp7icDw6w&_nc_ht=scontent.fhan2-4.fna&oh=e17f2be715b2f9c02c6d21ad7f2198a9&oe=6198E624"
                alt=""
                className="rounded-pill"
                style={{ width: "40px" }}
              />
            </a>
          </div>
        </div>
      </nav>
      <div
        className="offcanvas offcanvas-end"
        id="demo"
        style={{ width: "300px" }}
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title">Chào khách!</h5>
          <button
            type="button"
            className="btn-close text-reset"
            data-bs-dismiss="offcanvas"
          ></button>
        </div>
        <div className="offcanvas-body">
          <nav>
            <div className="nav nav-tabs" id="nav-tab" role="tablist">
              <button
                className="nav-link active"
                id="nav-home-tab"
                data-bs-toggle="tab"
                data-bs-target="#nav-home"
                type="button"
                role="tab"
                aria-controls="nav-home"
                aria-selected="true"
              >
                Đăng nhập
              </button>
              <button
                className="nav-link"
                id="nav-profile-tab"
                data-bs-toggle="tab"
                data-bs-target="#nav-profile"
                type="button"
                role="tab"
                aria-controls="nav-profile"
                aria-selected="false"
              >
                Đăng ký
              </button>
            </div>
          </nav>
          <div className="tab-content" id="nav-tabContent">
            <div
              className="tab-pane fade show active"
              id="nav-home"
              role="tabpanel"
              aria-labelledby="nav-home-tab"
            >
              <form>
                <div className="mb-3 mt-3">
                  <label htmlFor="email" className="form-label">
                    Email:
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    placeholder="Enter email"
                    name="email"
                  ></input>
                </div>
                <div className="mb-3">
                  <label htmlFor="pwd" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    name="pswd"
                    id="pwd"
                    placeholder="Enter password"
                    className="form-control"
                  />
                </div>
                <div className="form-check mb-3">
                  <label htmlFor="" className="form-check-label">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      name="remember"
                    />
                    Remember me
                  </label>
                </div>
                <i className="bi bi-meta"></i>
                <button type="submit" className="btn btn-primary">
                  Submit
                </button>
              </form>
            </div>
            <div
              className="tab-pane fade"
              id="nav-profile"
              role="tabpanel"
              aria-labelledby="nav-profile-tab"
            ></div>
          </div>
        </div>
      </div>

      <div className="container">{children}</div>
    </div>
  );
}
