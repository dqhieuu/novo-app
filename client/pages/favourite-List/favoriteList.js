import React, { useState } from 'react';
import Link from 'next/link';
import {
  FaHome,
  FaAngleDoubleRight,
  FaEye,
  FaRegThumbsUp,
} from 'react-icons/fa';
import WEB_CONSTANTS from '../../utilities/constants';
import NULL_CONSTANTS from '../../utilities/null-Constants';
import Image from 'next/image';
import RelativeTimestamp from '../../utilities/to-Relative-Time-stamp';
import styles from './favoriteList.module.css';
import ByWeek from '../../components/ranking-In-Manga-Page/by-Week';
import ByMonth from '../../components/ranking-In-Manga-Page/by-Month';
import ByYear from '../../components/ranking-In-Manga-Page/by-Year';
import ReactPaginate from 'react-paginate';
import ScrollButton from '../../utilities/scrollButton';
export default function FavoriteList() {
  const server = WEB_CONSTANTS.SERVER;
  const favoriteBooks =
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('favorite'))
      : [];
  const bookPerPage = 12;
  const [pageNumber, setPageNumber] = useState(0);

  const pageVisited = pageNumber * bookPerPage;
  const pageCount = Math.ceil(
    favoriteBooks && favoriteBooks.length / bookPerPage
  );
  const changePage = ({ selected }) => {
    setPageNumber(selected);
  };
  return (
    <div style={{ background: '#EBEBEB' }}>
      <div
        className="container pt-4"
        style={{ background: '#f9f9f9', height: '100vh' }}
      >
        <div className="row">
          <div className="col-12 col-lg-8">
            <div className=" d-flex justify-content-start align-content-center">
              <Link href="/" passHref>
                <p style={{ color: '#1abc9c' }}>
                  <FaHome></FaHome>
                </p>
              </Link>
              <div className="ms-2">
                <p style={{ color: '#1abc9c' }}>
                  <FaAngleDoubleRight></FaAngleDoubleRight>
                  {' ' + 'Truyện Yêu Thích'}
                </p>
              </div>
            </div>
            <div className="mt-3">
              <div className="row">
                {' '}
                {favoriteBooks
                  .slice(
                    pageVisited,
                    pageVisited + bookPerPage
                  )
                  .map((book, index) => (
                    <Link
                      href={'/manga/' + parseInt(book.id)}
                      passHref
                      key={index}
                    >
                      <div className="col-6 col-lg-3">
                        <div className={styles.container}>
                          <div
                            style={{
                              width: '80%',
                              aspectRatio: '3/4',
                              overflow: 'hidden',
                              position: 'relative',
                              borderRadius: '0.75rem',
                            }}
                          >
                            <Image
                              src={
                                book.image
                                  ? `${server}/image/${book.image}`
                                  : NULL_CONSTANTS.BOOK_GROUP_IMAGE
                              }
                              alt="book cover"
                              layout="fill"
                              objectFit="cover"
                            ></Image>
                          </div>
                          <div className={styles.overlay}>
                            <div className="d-flex justify-content-around">
                              <p>
                                <FaEye></FaEye>
                                {' ' + book.view}
                              </p>
                              <p>
                                <FaRegThumbsUp></FaRegThumbsUp>
                                {' ' + book.likeCount}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div style={{ width: '80%' }}>
                          <h5>{book.name}</h5>
                          {book.listChapters &&
                            book.listChapters.map(
                              (chapter) => (
                                <Link
                                  key={
                                    chapter.chapterNumber
                                  }
                                  passHref
                                  href={
                                    '/chapter/' + chapter.id
                                  }
                                >
                                  <div
                                    className={
                                      styles.chapter
                                    }
                                  >
                                    <div className="d-flex justify-content-between">
                                      <p>
                                        {'Chap ' +
                                          chapter.chapterNumber}
                                      </p>
                                      <p
                                        style={{
                                          fontSize:
                                            '0.75rem',
                                          color: '#95a5a6',
                                          fontStyle:
                                            'italic',
                                        }}
                                      >
                                        <RelativeTimestamp>
                                          {
                                            chapter.timePosted
                                          }
                                        </RelativeTimestamp>
                                      </p>
                                    </div>
                                  </div>
                                </Link>
                              )
                            )}
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
            <div className="mt-3 d-flex justify-content-center">
              {favoriteBooks && (
                <ReactPaginate
                  breakLabel="..."
                  previousLabel="Trước"
                  nextLabel="Sau"
                  pageCount={pageCount}
                  onPageChange={changePage}
                  pageClassName="page-item"
                  pageLinkClassName="page-link"
                  previousClassName="page-item"
                  previousLinkClassName="page-link"
                  nextClassName="page-item"
                  nextLinkClassName="page-link"
                  breakClassName="page-item"
                  breakLinkClassName="page-link"
                  containerClassName="pagination"
                  activeClassName="active"
                  renderOnZeroPageCount={null}
                ></ReactPaginate>
              )}
            </div>
          </div>
          <div
            className="col-12 col-sm-4 mt-3"
            data-aos="fade-up"
          >
            <h5
              style={{
                borderLeft: '5px solid green',
                color: 'green',
              }}
              className="ps-2 mt-5"
            >
              ĐỌC NHIỀU NHẤT
            </h5>

            <ul
              className="nav nav-tabs nav-justified"
              id="myTab"
              role="tablist"
            >
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link active"
                  id="week-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#week"
                  type="button"
                  role="tab"
                  aria-controls="week"
                  aria-selected="true"
                >
                  Tuần
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link"
                  id="month-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#month"
                  type="button"
                  role="tab"
                  aria-controls="month"
                  aria-selected="false"
                >
                  Tháng
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link"
                  id="year-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#year"
                  type="button"
                  role="tab"
                  aria-controls="year"
                  aria-selected="true"
                >
                  Năm
                </button>
              </li>
            </ul>
            <div className="tab-content ">
              <div
                className="tab-pane active"
                id="week"
                role="tabpanel"
                aria-labelledby="week-tab"
              >
                <ByWeek></ByWeek>
              </div>
              <div
                className="tab-pane "
                id="month"
                role="tabpanel"
                aria-labelledby="month-tab"
              >
                <ByMonth></ByMonth>
              </div>
              <div
                className="tab-pane "
                id="year"
                role="tabpanel"
                aria-labelledby="year-tab"
              >
                <ByYear></ByYear>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ScrollButton></ScrollButton>
    </div>
  );
}
