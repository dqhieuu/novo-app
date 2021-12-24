import Link from 'next/link';
import { useContext } from 'react';
import { MangaContext } from '../context/manga-Context';
import { UserContext } from '../context/user-Context';
import DisplayImg from '../components/display-Img/display-Img';
import ImgOverlay from '../components/img-Overlay/img-Overlay';
import '../styles/Home.module.css';
import NULL_CONSTANTS from '../utilities/null-Constants';
import styles from '../styles/Home.module.css';
import ByWeek from '../components/ranking-In-Manga-Page/by-Week';
import ByMonth from '../components/ranking-In-Manga-Page/by-Month';
import '../public/images/null-Book.png';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { FaArrowRight } from 'react-icons/fa';
import ScrollButton from '../utilities/scrollButton';

export default function Home() {
  const {
    latestManga,
    randomBooks,
    latestComment,
    server,
  } = useContext(MangaContext);
  const { userInfo } = useContext(UserContext);
  const router = useRouter();
  function checkComplete() {
    if (userInfo.role === 'oauth_incomplete') {
      router.replace('/registration/oauthComplete');
    }
  }
  const historyBook =
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('history'))
      : [];
  const favoriteBooks =
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('favorite'))
      : [];

  return (
    <div
      className="container-fluid"
      style={{ background: '#EBEBEB' }}
    >
      {checkComplete()}
      <div
        className="container pt-4"
        style={{ background: '#f9f9f9' }}
      >
        <h5
          style={{
            borderLeft: '5px solid red',
            color: 'red',
          }}
          className="ps-2  "
        >
          CHAP MỚI NHẤT
        </h5>
        <div className="row">
          {latestManga.slice(0, 12).map((manga) => (
            <Link
              href={`manga/${manga.id}`}
              key={manga.id}
              passHref
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
                  text={
                    manga.latestChapter == null
                      ? NULL_CONSTANTS.CHAPTER_NUMBER_NULL
                      : 'Chap ' + manga.latestChapter
                  }
                  title={manga.title}
                  bgColor="red"
                ></DisplayImg>
              </div>
            </Link>
          ))}
        </div>

        {randomBooks.length > 1 ? (
          <div className="row mt-5" data-aos="fade-up">
            <Link
              href={`manga/${randomBooks[0].id}`}
              passHref
            >
              <div className="col-12 col-lg-6 mt-1">
                <ImgOverlay
                  view={`${randomBooks[0].views} lượt đọc`}
                  srcImg={
                    randomBooks[0].image
                      ? `${server}/image/${randomBooks[0].image}`
                      : NULL_CONSTANTS.BOOK_GROUP_IMAGE
                  }
                  description={randomBooks[0].title}
                  title={randomBooks[0].title}
                ></ImgOverlay>
              </div>
            </Link>
            <Link
              href={`manga/${randomBooks[1].id}`}
              passHref
            >
              <div className="col-12 col-lg-6 mt-1">
                <ImgOverlay
                  view={`${randomBooks[1].views} lượt đọc`}
                  srcImg={
                    randomBooks[1].image
                      ? `${server}/image/${randomBooks[1].image}`
                      : NULL_CONSTANTS.BOOK_GROUP_IMAGE
                  }
                  description={randomBooks[1].title}
                  title={randomBooks[1].title}
                ></ImgOverlay>
              </div>
            </Link>
          </div>
        ) : (
          ''
        )}
        <div className="row">
          <div className="col-sm-8">
            <h5
              style={{
                borderLeft: '5px solid #ff7043',
                color: '#ff7043',
              }}
              className="ps-2 mt-5"
            >
              ĐỪNG BỎ LỠ
            </h5>
            <div className="row">
              {randomBooks
                .slice(2, 10)
                .map((randomBook) => (
                  <Link
                    href={`manga/${randomBook.id}`}
                    key={randomBook.id}
                    passHref
                  >
                    <div className="col-sm-6 mt-2">
                      <div
                        className="row"
                        data-aos="fade-right"
                      >
                        <div className="col-6">
                          <DisplayImg
                            srcImg={
                              randomBook.image
                                ? `${server}/image/${randomBook.image}`
                                : NULL_CONSTANTS.BOOK_GROUP_IMAGE
                            }
                            text={
                              randomBook.likes > 0
                                ? `${randomBook.likes} lượt thích`
                                : `0 lượt thích`
                            }
                            bgColor="#ff7043"
                          ></DisplayImg>
                        </div>
                        <div className="col-6 mt-2">
                          <h5
                            style={{ color: '#ff7043' }}
                            className={styles.object}
                          >
                            {randomBook.title}
                          </h5>
                          <p>{randomBook.views} lượt đọc</p>
                          <div className="list-chapter">
                            <p className="border-bottom">
                              Chap mới nhất
                            </p>
                            <div>
                              <Link
                                href={
                                  '/chapter/' +
                                  randomBook.latestChapter
                                }
                                passHref
                              >
                                <p
                                  className={styles.object}
                                  style={{
                                    listStyleType: 'none',
                                  }}
                                >
                                  {randomBook.latestChapter ==
                                  null
                                    ? 'Chưa có chap nào'
                                    : `Chap ${randomBook.latestChapter}`}
                                </p>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
          <div
            className="col-12 col-sm-4 mt-4"
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
                <ByMonth></ByMonth>
              </div>
            </div>
            {Object.keys(userInfo).length > 0 &&
              historyBook && (
                <div>
                  <h5
                    style={{
                      borderLeft: '5px solid #8e44ad',
                      color: '#8e44ad',
                    }}
                    className="ps-2 mt-3"
                  >
                    LỊCH SỬ ĐỌC
                  </h5>
                  <div
                    style={{
                      height: '500px',
                      overflowY: 'auto',
                      borderRadius: '0.75rem',
                      border: '1px solid lightgray',
                    }}
                  >
                    {historyBook &&
                      historyBook
                        .slice(0, 5)
                        .map((book) => (
                          <div
                            key={book.id}
                            className={`mb-2 row pb-2 `}
                            style={{
                              borderBottom:
                                '1px solid lightgrey',
                            }}
                          >
                            <div
                              className={`col-3 ms-2 mt-2 `}
                            >
                              <Link
                                href={`/manga/${book.id}`}
                                passHref
                              >
                                <div
                                  style={{
                                    width: '80px',
                                    aspectRatio: '1/1',
                                    position: 'relative',
                                    borderRadius: '0.75rem',
                                    overflow: 'hidden',
                                  }}
                                >
                                  <Image
                                    src={
                                      book.image
                                        ? `${server}/image/${book.image}`
                                        : NULL_CONSTANTS.BOOK_GROUP_IMAGE
                                    }
                                    alt="Book Cover Art"
                                    layout="fill"
                                    objectFit="cover"
                                  ></Image>
                                </div>
                              </Link>
                            </div>
                            <div className="col-8 mt-2">
                              <Link
                                href={`/manga/${book.id}`}
                                passHref
                              >
                                <h5
                                  className={styles.object}
                                >
                                  {book.name}
                                </h5>
                              </Link>

                              <Link
                                href={`/chapter/${book.chapterId}`}
                                passHref
                              >
                                <p
                                  className={styles.object}
                                  style={{
                                    color: '#bdc3c7',
                                  }}
                                >{`Đọc tiếp chapter ${book.latestChapter}`}</p>
                              </Link>
                            </div>
                          </div>
                        ))}
                  </div>
                </div>
              )}
            {Object.keys(userInfo).length > 0 &&
              favoriteBooks && (
                <div>
                  <div className="d-flex justify-content-between">
                    <h5
                      style={{
                        borderLeft: '5px solid #e74c3c',
                        color: '#e74c3c',
                      }}
                      className="ps-2 mt-3"
                    >
                      TRUYỆN YÊU THÍCH
                    </h5>
                    <Link
                      href={'/favourite-List/favoriteList'}
                      passHref
                    >
                      <div className="mt-3">
                        {'Xem thêm '}
                        <FaArrowRight></FaArrowRight>
                      </div>
                    </Link>
                  </div>

                  <div
                    style={{
                      height: '500px',
                      overflowY: 'auto',
                      borderRadius: '0.75rem',
                      border: '1px solid lightgray',
                    }}
                  >
                    {console.log(favoriteBooks)}
                    {favoriteBooks &&
                      favoriteBooks
                        .slice(0, 5)
                        .map((book) => (
                          <div
                            key={book.id}
                            className={`mb-2 row pb-2 `}
                            style={{
                              borderBottom:
                                '1px solid lightgrey',
                            }}
                          >
                            <div
                              className={`col-3 ms-2 mt-2 `}
                            >
                              <Link
                                href={`/manga/${book.id}`}
                                passHref
                              >
                                <div
                                  style={{
                                    width: '80px',
                                    aspectRatio: '1/1',
                                    position: 'relative',
                                    borderRadius: '0.75rem',
                                    overflow: 'hidden',
                                  }}
                                >
                                  <Image
                                    src={`${server}/image/${book.image}`}
                                    alt="Book Cover Art"
                                    layout="fill"
                                    objectFit="cover"
                                  ></Image>
                                </div>
                              </Link>
                            </div>
                            <div className="col-8 mt-2">
                              <Link
                                href={`/manga/${book.id}`}
                                passHref
                              >
                                <h5
                                  className={styles.object}
                                >
                                  {book.name}
                                </h5>
                              </Link>
                              {book.latestChapter && (
                                <p
                                  style={{
                                    fontStyle: 'italic',
                                    color: '#95a5a6',
                                  }}
                                >
                                  {'Chap mới nhất: ' +
                                    book.latestChapter
                                      .chapterNumber}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                  </div>
                </div>
              )}

            <h5
              style={{
                borderLeft: '5px solid #3498db',
                color: '#3498db',
              }}
              className="ps-2 mt-3"
            >
              BÌNH LUẬN MỚI
            </h5>
            <div
              className="border"
              style={{
                height: '500px',
                overflowY: 'auto',
                borderRadius: '0.75rem',
              }}
            >
              {latestComment &&
                latestComment.map((comment) => (
                  <div
                    key={comment.commentId}
                    className="border-bottom"
                  >
                    <div className="d-flex justify-content-between ps-2 pe-2 pt-2">
                      <Link
                        href={'/manga/' + comment.bookId}
                        passHref
                      >
                        <h5 className={styles.object}>
                          {comment.bookName}
                        </h5>
                      </Link>
                      <Link
                        href={
                          'chapter/' + comment.chapterId
                        }
                        passHref
                      >
                        <p className={styles.object}>
                          {comment.chapterNumber
                            ? 'Chap ' +
                              comment.chapterNumber
                            : ' '}
                        </p>
                      </Link>
                    </div>
                    <div className="row">
                      <div className="col-3">
                        <div
                          style={{
                            borderRadius: '0.75rem',
                            width: '80%',
                            aspectRatio: '1/1',
                            position: 'relative',
                            overflow: 'hidden',
                          }}
                        >
                          <Link
                            href={'/user/' + comment.userId}
                            passHref
                          >
                            <Image
                              src={
                                comment.userAvatar
                                  ? `${server}/image/${comment.userAvatar}`
                                  : NULL_CONSTANTS.AVATAR
                              }
                              alt="Describe"
                              objectFit="cover"
                              layout="fill"
                            ></Image>
                          </Link>
                        </div>
                      </div>
                      <div className="col-9">
                        <div className="d-flex flex-column justify-content-between">
                          <Link
                            href={'/user/' + comment.userId}
                            passHref
                          >
                            <p
                              className={styles.object}
                              style={{ color: '#e74c3c' }}
                            >
                              {comment.userName}
                            </p>
                          </Link>
                          <p className="text-break">
                            {comment.comment}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
      <ScrollButton></ScrollButton>
    </div>
  );
}
