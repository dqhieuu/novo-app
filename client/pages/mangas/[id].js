import DisplayImg from '../../components/displayImg';
import Link from 'next/link';
import { useContext, useState, useEffect } from 'react';
import { MangaContext } from '../../Context/MangaContext';
import ReactPaginate from 'react-paginate';
import TimeAgo from 'react-timeago';
import vietnameseStrings from 'react-timeago/lib/language-strings/vi';
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';
import styles from './[id].module.css';
import NULL_CONSTANTS from '../../utilities/nullConstants';
import WEB_CONSTANTS from '../../utilities/constants';
import {
  FaEye,
  FaNewspaper,
  FaTags,
  FaUser,
  FaWifi,
} from 'react-icons/fa';
import ByWeek from '../../components/rankingInMangaPage/byWeek';
import ByMonth from '../../components/rankingInMangaPage/byMonth';
import ByYear from '../../components/rankingInMangaPage/byYear';
export async function getServerSideProps(context) {
  const server = WEB_CONSTANTS.SERVER;
  const { params } = context;
  const { id } = params;
  const response = await fetch(`${server}/book/${id}`);
  const data = await response.json();
  const responseComment = await fetch(
    `${server}/comment/?bookGroupId=${id}`
  );
  const dataComment = await responseComment.json();

  return {
    props: {
      manga: data,
      comments: dataComment.comments,
    },
  };
}

export default function Details({ manga, comments }) {
  const [pageNumber, setPageNumber] = useState(0);
  const cmtPerPage = 5;
  const pageVisited = pageNumber * cmtPerPage;

  const { server, randomBooks } = useContext(MangaContext);
  const pageCount = comments
    ? Math.ceil(comments.length / cmtPerPage)
    : 0;
  const changePage = ({ selected }) => {
    setPageNumber(selected);
  };

  const formatter = buildFormatter(vietnameseStrings);
  const displayDatas = comments ? (
    comments
      .slice(pageVisited, pageVisited + cmtPerPage)
      .map((comment, index) => (
        <div className="row mb-3" key={index}>
          <div className="col-lg-2 col-3">
            <img
              src={
                comment.userAvatar
                  ? `${sever}/image/${comment.userAvatar}`
                  : NULL_CONSTANTS.BOOK_GROUP_IMAGE
              }
              width={'60%'}
              className="rounded-circle img-thumbnail"
              alt=""
            />
          </div>
          <div
            className="col-8"
            style={{
              border: '1px solid #bdc3c7',
              borderRadius: '10px',
              background: '#ecf0f1',
            }}
          >
            <p
              className={
                'display-6 text-primary ' + styles.object
              }
              style={{ fontSize: '20px' }}
            >
              {comment.userName}
              <span
                style={{
                  fontSize: '12px',
                  color: 'black',
                }}
              >
                {' '}
                <TimeAgo
                  date={comment.timePosted / 1000}
                  formatter={formatter}
                ></TimeAgo>
              </span>
            </p>
            <p
              style={{
                fontStyle: 'italic',
                fontSize: '13px',
              }}
            >
              {comment.comment}
            </p>
          </div>
        </div>
      ))
  ) : (
    <div>Không có comment nào</div>
  );

  return (
    <div style={{ background: '#EBEBEB' }}>
      <div
        className="container"
        style={{ background: '#f9f9f9' }}
      >
        <div className="row">
          <div className="col-lg-8 col-12 mt-3">
            <h3
              className="d-flex justify-content-center"
              style={{ color: '#27ae60' }}
            >
              {manga.name}
            </h3>
            <div className="row mt-3">
              <div
                className="col-lg-3 col-12"
                data-aos="fade-right"
              >
                <DisplayImg
                  srcImg={
                    manga.primaryCoverArt
                      ? `${server}/image/${manga.primaryCoverArt}`
                      : NULL_CONSTANTS.BOOK_GROUP_IMAGE
                  }
                ></DisplayImg>
              </div>
              <div
                className="col-lg-6 col-12"
                data-aos="fade-left"
              >
                <div className="d-flex justify-content-between ">
                  <div>
                    <p>
                      <FaUser></FaUser> {' ' + 'Tác giả'}
                    </p>
                    <p>
                      <FaWifi></FaWifi>
                      {' Tình trạng'}
                    </p>
                    <p>
                      <FaNewspaper></FaNewspaper>
                      {' Mới nhất'}
                    </p>
                    <p>
                      <FaEye></FaEye>
                      {' Lượt đọc'}
                    </p>
                    <p>
                      <FaTags></FaTags>
                      {' Thể loại'}
                    </p>
                  </div>
                  <div>
                    <p>
                      {manga.authors.length > 0
                        ? manga.authors.map(
                            (author, index) => (
                              <Link
                                href={`/authors/${author.id}`}
                                passHref
                                key={index}
                              >
                                <span
                                  className={styles.object}
                                >
                                  {author.name + ', '}
                                </span>
                              </Link>
                            )
                          )
                        : 'Đang cập nhật'}
                    </p>
                    <p>Đang cập nhật</p>
                    <p style={{ color: '#27ae60' }}>
                      {manga.chapters.length > 0
                        ? 'Chap ' +
                          manga.chapters[0].chapterNumber
                        : 'Chưa có chap mới'}
                    </p>
                    <p>{manga.views}</p>
                    <p>
                      {manga.genres &&
                        manga.genres.map((genre) => (
                          <Link
                            key={genre.id}
                            href={`/genres/${genre.id}`}
                          >
                            <span className={styles.object}>
                              {genre.name + ' '}
                            </span>
                          </Link>
                        ))}
                    </p>
                  </div>
                </div>
                <div className="button-utilities col-12">
                  <button
                    type="button"
                    className="btn btn-outline-success me-2"
                  >
                    Thích{' '}
                    <span className="badge bg-danger">
                      {manga.likeCount}
                    </span>
                  </button>
                  {manga.chapters.length != 0 && (
                    <Link
                      passHref
                      href={`/chapters/${
                        manga.chapters[
                          manga.chapters.length - 1
                        ].id
                      }`}
                    >
                      <button
                        type="button"
                        className="btn btn-dark "
                      >
                        Đọc từ đầu
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
            <div
              className="mt-3"
              style={{ borderRadius: '10px' }}
            >
              <h5
                style={{
                  borderLeft: '5px solid #2980b9',
                  color: '#2980b9',
                }}
                className="ps-2"
              >
                GALLERIES
              </h5>
              {manga.coverArts.length > 0 && (
                <div
                  id="carouselExampleCaptions"
                  className="carousel slide carousel-dark"
                  data-bs-ride="carousel"
                  data-aos="fade-up"
                >
                  <div className="carousel-indicators">
                    <button
                      type="button"
                      data-bs-target="#carouselExampleDark"
                      data-bs-slide-to="0"
                      className="active"
                    ></button>
                    {Array.from(
                      Array(
                        manga.coverArts.length - 1
                      ).keys()
                    ).map((value, index) => (
                      <button
                        type="button"
                        data-bs-target="#carouselExampleDark"
                        data-bs-slide-to={value + 1}
                        key={index}
                      ></button>
                    ))}
                  </div>
                  <div
                    className="carousel-inner"
                    style={{ borderRadius: '5px' }}
                  >
                    <div className="carousel-item active">
                      <img
                        src={`${server}/image/${manga.coverArts[0]}`}
                        width="100%"
                        style={{
                          aspectRatio: '16/9',
                          objectFit: 'cover',
                        }}
                        alt="Describe"
                      />
                    </div>
                    {manga.coverArts.length > 0 &&
                      manga.coverArts
                        .slice(1, manga.coverArts.length)
                        .map((coverArt, index) => (
                          <div
                            className="carousel-item"
                            key={index}
                          >
                            <img
                              src={`${server}/image/${coverArt}`}
                              width="100%"
                              style={{
                                aspectRatio: '16/9',
                                objectFit: 'cover',
                              }}
                              alt="Describe"
                            />
                          </div>
                        ))}
                  </div>
                  <button
                    className="carousel-control-prev"
                    type="button"
                    data-bs-target="#carouselExampleCaptions"
                    data-bs-slide="prev"
                  >
                    <span
                      className="carousel-control-prev-icon"
                      aria-hidden="true"
                    ></span>
                    <span className="visually-hidden">
                      Previous
                    </span>
                  </button>
                  <button
                    className="carousel-control-next"
                    type="button"
                    data-bs-target="#carouselExampleCaptions"
                    data-bs-slide="next"
                  >
                    <span
                      className="carousel-control-next-icon"
                      aria-hidden="true"
                    ></span>
                    <span className="visually-hidden">
                      Next
                    </span>
                  </button>
                </div>
              )}
            </div>
            <div className="manga-description mt-3">
              <h5
                style={{
                  borderLeft: '5px solid red',
                  color: 'red',
                }}
                className="ps-2"
              >
                NỘI DUNG
              </h5>
              <p>{manga.description}</p>
            </div>
            <div className="mt-1">
              <h5
                style={{
                  borderLeft: '5px solid #8e44ad',
                  color: ' #8e44ad',
                }}
                className="ps-2"
              >
                DANH SÁCH CHAP
              </h5>
              <div
                className="d-flex justify-content-between"
                style={{ borderBottom: '1px solid grey' }}
              >
                <p>Tên chap</p>
                <p>Cập nhật</p>
                <p>Người đăng</p>
              </div>
              <div className="list-chapter">
                {manga.chapters.map((chapter, index) => (
                  <div
                    className="d-flex justify-content-between"
                    key={chapter.id}
                    style={{
                      borderBottom: '1px solid lightgrey',
                    }}
                  >
                    <Link href={`/chapters/${chapter.id}`}>
                      <p className={styles.object}>
                        Chapter
                        {' ' + chapter.chapterNumber}
                      </p>
                    </Link>

                    <p>
                      {new Date(
                        chapter.timePosted
                      ).toString()}
                    </p>

                    <p className={styles.object}>
                      {chapter.userPosted.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div
            className="col-lg-4  col-12 mt-3"
            data-aos="fade-left"
          >
            <h5
              style={{
                borderLeft: '5px solid green',
                color: 'green',
              }}
              className="ps-2"
            >
              BẢNG XẾP HẠNG
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

        <div className=" mt-3">
          <h5
            style={{
              borderLeft: '5px solid #1abc9c',
              color: '#1abc9c',
            }}
            className="ps-2"
          >
            ĐỪNG BỎ LỠ
          </h5>
        </div>
        <div className="row">
          {randomBooks.slice(0, 6).map((manga, index) => (
            <Link
              href={`/mangas/${manga.id}`}
              passHref
              key={index}
            >
              <div
                className="col-6 col-lg-2"
                data-aos="fade-up"
              >
                <DisplayImg
                  srcImg={
                    manga.image
                      ? `${server}/image/${manga.image}`
                      : NULL_CONSTANTS.BOOK_GROUP_IMAGE
                  }
                  size={2}
                  text={
                    manga.latestChapter == null
                      ? NULL_CONSTANTS.CHAPTER_NUMBER_NULL
                      : 'Chap ' + manga.latestChapter
                  }
                  title={manga.title}
                  bgColor="#1abc9c"
                ></DisplayImg>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-3 col-lg-8">
          <h5
            style={{
              borderLeft: '5px solid #f1c40f',
              color: '#f1c40f',
            }}
            className="ps-2"
          >
            BÌNH LUẬN
          </h5>

          <div className="comment-section mt-3">
            {displayDatas}
            <div className="d-flex justify-content-center">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
