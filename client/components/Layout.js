import Head from 'next/head';
import Link from 'next/link';
import React, { useContext } from 'react';
import { MangaContext } from '../Context/MangaContext';

import UserModal from './userModal/UserModal';
import SearchBar from './searchBar/searchBar';

export default function Layout({ children }) {
  const { server, genres } = useContext(MangaContext);
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
          <div
            className="collapse navbar-collapse"
            id="navbarSupportedContent"
          >
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
                >
                  <div className="container-fluid">
                    <div className="row">
                      {genres.map((genre) => (
                        <Link
                          href={`/genres/${genre.id}`}
                          key={genre.id}
                        >
                          <div className="col-2 col-lg-12">
                            <a>{genre.name}</a>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </ul>
              </li>
              <li className="nav-item">
                <Link href="/rankingManga" passHref>
                  <a className="nav-link">BXH</a>
                </Link>
              </li>

              <li className="nav-item">
                <a className="nav-link" href="#">
                  Donate
                </a>
              </li>
            </ul>
            <Link href="/uploadManga/uploadManga" passHref>
              <button className="nav-item btn btn-dark me-2">
                Upload truyện
              </button>
            </Link>

            <SearchBar></SearchBar>

            <a
              href="#"
              className="navbar-brand"
              data-bs-toggle="offcanvas"
              data-bs-target="#demo"
            >
              <img
                src="https://www.niadd.com/files/images/def_logo.svg"
                alt=""
                className="rounded-pill"
                style={{
                  borderRadius: '50%',
                  width: '30px',
                }}
              />
            </a>
          </div>
        </div>
      </nav>
      <UserModal></UserModal>

      <div>{children}</div>
    </div>
  );
}
