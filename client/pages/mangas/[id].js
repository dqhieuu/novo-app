import DisplayImg from '../../components/displayImg';
import Link from 'next/link';
import { useContext, useState, useEffect } from 'react';
import { MangaContext } from '../../Context/MangaContext';
import ReactPaginate from 'react-paginate';

import NULL_CONSTANTS from '../../utilities/nullConstants';
import WEB_CONSTANTS from '../../utilities/constants';

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

  const { server, randomBooks, mostViewedWeek } =
    useContext(MangaContext);
  const pageCount = comments
    ? Math.ceil(comments.length / cmtPerPage)
    : 0;
  const changePage = ({ selected }) => {
    setPageNumber(selected);
  };
  const displayDatas = comments ? (
    comments
      .slice(pageVisited, pageVisited + cmtPerPage)
      .map((comment) => (
        <div className="row mb-3">
          <div className="col-2">
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
              className="display-6 text-primary"
              style={{ fontSize: '20px' }}
            >
              {comment.userName}
              <span
                style={{
                  fontSize: '12px',
                  color: 'black',
                }}
              >
                {' ' + comment.timePosted}
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
    <div>Không có comments nào</div>
  );

  return (
    <div className="container">
      <div className="row mt-3">
        <div className="col-lg-8 col-12">
          <div className="row">
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
                height="282px"
              ></DisplayImg>
            </div>
            <div
              className="col-lg-9 col-12"
              data-aos="fade-left"
            >
              <h3>{manga.name}</h3>
              <div className="d-flex justify-content-between col-lg-5 col-8">
                <div>
                  <p>Tác giả</p>
                  <p>Tình trạng</p>
                  <p>Mới nhất</p>
                  <p>Lượt đọc</p>
                </div>
                <div>
                  <p>
                    {manga.authors.length > 0
                      ? manga.authors.map((author) => (
                          <Link
                            href={`/authors/${author.id}`}
                          >
                            <span>
                              {author.name + ', '}
                            </span>
                          </Link>
                        ))
                      : 'Đang cập nhật'}
                  </p>
                  <p>Đang cập nhật</p>
                  <p style={{ color: 'red' }}>
                    {manga.chapters.length > 0
                      ? 'Chap ' +
                        manga.chapters[0].chapterNumber
                      : 'Chưa có chap mới'}
                  </p>
                  <p>{manga.views}</p>
                </div>
              </div>
              <div className="button-utilities col-12">
                <button
                  type="button"
                  class="btn btn-success me-2"
                >
                  Thích{' '}
                  <span className="badge bg-danger">
                    {manga.likeCount}
                  </span>
                </button>
                {manga.chapters.length != 0 && (
                  <Link
                    href={`/chapters/${
                      manga.chapters[
                        manga.chapters.length - 1
                      ].id
                    }`}
                  >
                    <button
                      type="button"
                      class="btn btn-primary "
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
                    Array(manga.coverArts.length - 1).keys()
                  ).map((index) => (
                    <button
                      type="button"
                      data-bs-target="#carouselExampleDark"
                      data-bs-slide-to={index + 1}
                    ></button>
                  ))}
                </div>
                <div className="carousel-inner">
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
                    <div className="carousel-caption d-none d-md-block">
                      <h5>{manga.name}</h5>
                      <p>{'Thể loại'}</p>
                      <p>
                        {manga.genres.map((genre) => (
                          <span>{genre.name + ' '}</span>
                        ))}
                      </p>
                    </div>
                  </div>
                  {manga.coverArts.length > 0 &&
                    manga.coverArts
                      .slice(1, manga.coverArts.length)
                      .map((coverArt) => (
                        <div className="carousel-item">
                          <img
                            src={`${server}/image/${coverArt}`}
                            width="100%"
                            style={{
                              aspectRatio: '16/9',
                              objectFit: 'cover',
                            }}
                            alt="Describe"
                          />
                          <div className="carousel-caption d-none d-md-block">
                            <h5>{manga.name}</h5>
                            <p>{'Thể loại'}</p>
                            <p>
                              {manga.genres.map((genre) => (
                                <span>
                                  {genre.name + ' '}
                                </span>
                              ))}
                            </p>
                          </div>
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
              <p>Tên Chap</p>
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
                    <p>
                      Chapter
                      {' ' + chapter.chapterNumber}
                    </p>
                  </Link>

                  <p>
                    {Date(chapter.timePosted).toString()}
                  </p>

                  <p>{chapter.userPosted.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div
          className="col-lg-4  col-12"
          data-aos="fade-left"
        >
          <h5
            style={{
              borderLeft: '5px solid green',
              color: 'green',
            }}
            className="ps-2"
          >
            TOP TRONG TUẦN
          </h5>
          {mostViewedWeek.slice(0, 3).map((manga) => (
            <Link href={`/mangas/${manga.id}`}>
              <div className="col-12">
                {' '}
                <DisplayImg
                  srcImg={
                    manga.image
                      ? `${server}/image/${manga.image}`
                      : NULL_CONSTANTS.BOOK_GROUP_IMAGE
                  }
                  text={manga.views + ' lượt đọc'}
                  title={manga.title}
                  height="205px"
                  bgColor="green"
                ></DisplayImg>
              </div>
            </Link>
          ))}
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
        {randomBooks.slice(0, 6).map((manga) => (
          <Link href={`/mangas/${manga.id}`}>
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
                height="282px"
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
              breakLabel="..."
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
  );
}
