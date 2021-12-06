import Head from 'next/head';
import Link from 'next/link';
import React, {
  useEffect,
  useState,
  useContext,
} from 'react';
import { MangaContext } from '../Context/MangaContext';
import { FaFacebook } from 'react-icons/fa';
import DisplayImg from './displayImg';
import UserModal from './userModal/UserModal';
import SearchBar from './searchBar/searchBar';
import UserSignUp from './userModal/userSignUp';
const mangaTypes = [
  'Action',
  'Adult',
  'Adventure',
  'Anime',
  'Award Winning',
  'Comedy',
  'Cooking',
  'Demons',
  'Doujinshi',
  'Drama',
  'Ecchi',
  'Fantasy',
  'Gender bender',
  'Harem',
  'Historical',
  'Horror',
  'Josei',
  'Live Action',
  'Magic',
  'Manhua',
  'Manhwa',
  'Martial Arts',
  'Mature',
];
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
                  style={{ width: '900px' }}
                >
                  <div className="container">
                    <div className="row">
                      <div
                        className="col-12 col-sm-12 col-md-12 col-lg-2"
                        style={{
                          borderRight: '1px solid grey',
                        }}
                      >
                        <li>
                          <a
                            className="dropdown-item"
                            href="#"
                          >
                            Manga
                          </a>
                        </li>
                        <li>
                          <a
                            className="dropdown-item"
                            href="#"
                          >
                            Manhwa
                          </a>
                        </li>

                        <li>
                          <a
                            className="dropdown-item"
                            href="#"
                          >
                            Manhua
                          </a>
                        </li>

                        <li>
                          <a
                            className="dropdown-item"
                            href="#"
                          >
                            Comic
                          </a>
                        </li>
                      </div>
                      <div className="col-12 col-sm-12 col-md-12 col-lg-2">
                        <li>
                          <a
                            className="dropdown-item"
                            href="#"
                          >
                            Manga
                          </a>
                        </li>
                        <li>
                          <a
                            className="dropdown-item"
                            href="#"
                          >
                            Manhwa
                          </a>
                        </li>

                        <li>
                          <a
                            className="dropdown-item"
                            href="#"
                          >
                            Manhua
                          </a>
                        </li>

                        <li>
                          <a
                            className="dropdown-item"
                            href="#"
                          >
                            Comic
                          </a>
                        </li>
                      </div>
                      <div className="col-12 col-sm-12 col-md-12 col-lg-2">
                        <li>
                          <a
                            className="dropdown-item"
                            href="#"
                          >
                            Manga
                          </a>
                        </li>
                        <li>
                          <a
                            className="dropdown-item"
                            href="#"
                          >
                            Manhwa
                          </a>
                        </li>

                        <li>
                          <a
                            className="dropdown-item"
                            href="#"
                          >
                            Manhua
                          </a>
                        </li>

                        <li>
                          <a
                            className="dropdown-item"
                            href="#"
                          >
                            Comic
                          </a>
                        </li>
                      </div>
                      <div className="col-12 col-sm-12 col-md-12 col-lg-2">
                        <li>
                          <a
                            className="dropdown-item"
                            href="#"
                          >
                            Manga
                          </a>
                        </li>
                        <li>
                          <a
                            className="dropdown-item"
                            href="#"
                          >
                            Manhwa
                          </a>
                        </li>

                        <li>
                          <a
                            className="dropdown-item"
                            href="#"
                          >
                            Manhua
                          </a>
                        </li>

                        <li>
                          <a
                            className="dropdown-item"
                            href="#"
                          >
                            Comic
                          </a>
                        </li>
                      </div>
                      <div className="col-12 col-sm-12 col-md-12 col-lg-2">
                        <li>
                          <a
                            className="dropdown-item"
                            href="#"
                          >
                            Manga
                          </a>
                        </li>
                        <li>
                          <a
                            className="dropdown-item"
                            href="#"
                          >
                            Manhwa
                          </a>
                        </li>

                        <li>
                          <a
                            className="dropdown-item"
                            href="#"
                          >
                            Manhua
                          </a>
                        </li>

                        <li>
                          <a
                            className="dropdown-item"
                            href="#"
                          >
                            Comic
                          </a>
                        </li>
                      </div>
                      <div className="col-12 col-sm-12 col-md-12 col-lg-2">
                        <li>
                          <a
                            className="dropdown-item"
                            href="#"
                          >
                            Manga
                          </a>
                        </li>
                        <li>
                          <a
                            className="dropdown-item"
                            href="#"
                          >
                            Manhwa
                          </a>
                        </li>

                        <li>
                          <a
                            className="dropdown-item"
                            href="#"
                          >
                            Manhua
                          </a>
                        </li>

                        <li>
                          <a
                            className="dropdown-item"
                            href="#"
                          >
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
            <Link href="/uploadManga/uploadManga">
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
                src="https://source.unsplash.com/random"
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

      <div className="container">{children}</div>
    </div>
  );
}
