import Head from 'next/head';

import Link from 'next/link';
import { useContext } from 'react';
import { MangaContext } from '../Context/MangaContext';
import DisplayImg from '../components/displayImg';
import ImgOverlay from '../components/ImgOverlay';
import '../styles/Home.module.css';
import { FaBeer } from 'react-icons/fa';
import NULL_CONSTANTS from '../utilities/nullConstants';
import styles from '../styles/Home.module.css';
import ByWeek from '../components/rankingInMangaPage/byWeek';
import ByMonth from '../components/rankingInMangaPage/byMonth';
export default function Home() {
  const {
    latestManga,
    randomBooks,
    mostViewedAll,
    comments,
    server,
  } = useContext(MangaContext);

  return (
    <div
      className="container-fluid"
      style={{ background: '#EBEBEB' }}
    >
      <div
        className="container "
        style={{ background: '#f9f9f9' }}
      >
        <h5
          style={{
            borderLeft: '5px solid red',
            color: 'red',
          }}
          className="ps-2 "
        >
          CHAP MỚI NHẤT
        </h5>
        <div className="row">
          {latestManga.slice(0, 12).map((manga) => (
            <Link
              href={`mangas/${manga.id}`}
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
        {randomBooks.length ? (
          <div className="row mt-5" data-aos="fade-up">
            <Link href={`mangas/${randomBooks[0].id}`}>
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
            <Link href={`mangas/${randomBooks[1].id}`}>
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
              {randomBooks.slice(0, 8).map((randomBook) => (
                <Link
                  href={`mangas/${randomBook.id}`}
                  key={randomBook.id}
                  passHref
                >
                  <div className="col-sm-6">
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
                          text={`${randomBook.views} lượt đọc`}
                          bgColor="#ff7043"
                        ></DisplayImg>
                      </div>
                      <div className="col-6">
                        <p
                          style={{ color: '#ff7043' }}
                          className={styles.object}
                        >
                          {randomBook.title}
                        </p>
                        <p>{randomBook.views} lượt đọc</p>
                        <div className="list-chapter">
                          <p className="border-bottom">
                            Chap mới nhất
                          </p>

                          <Link href="/">
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
                </Link>
              ))}
            </div>
          </div>
          <div className="col-12 col-sm-4">
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
              style={{ height: '500px', overflowY: 'auto' }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
