import Head from 'next/head';

import Link from 'next/link';
import { useContext } from 'react';
import { MangaContext } from '../Context/MangaContext';
import DisplayImg from '../components/displayImg';
import ImgOverlay from '../components/ImgOverlay';
import '../styles/Home.module.css';
import { FaBeer } from 'react-icons/fa';
import NULL_CONSTANTS from '../utilities/nullConstants';

export default function Home() {
  const {
    latestManga,
    randomBooks,
    mostViewedAll,
    mostViewedMonth,
    mostViewedYear,
    server,
  } = useContext(MangaContext);

  return (
    <div className="container">
      <h5
        style={{
          borderLeft: '5px solid red',
          color: 'red',
        }}
        className="ps-2 mt-5"
      >
        CHAP MỚI NHẤT
      </h5>
      <div className="row">
        {latestManga.slice(0, 12).map((manga) => (
          <Link href={`mangas/${manga.id}`}>
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
              <Link href={`mangas/${randomBook.id}`}>
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
                        height="260px"
                        bgColor="#ff7043"
                      ></DisplayImg>
                    </div>
                    <div className="col-6">
                      <p style={{ color: '#ff7043' }}>
                        {randomBook.title}
                      </p>
                      <p>{randomBook.views} lượt đọc</p>
                      <div className="list-chapter">
                        <p className="border-bottom">
                          Chap mới nhất
                        </p>

                        <Link href="/">
                          <p
                            className="border-bottom"
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

          {mostViewedAll.slice(0, 5).map((viewbook) => (
            <Link href={`mangas/${viewbook.id}`}>
              <div className="col-12" data-aos="fade-left">
                <DisplayImg
                  srcImg={
                    viewbook.image
                      ? `${server}/image/${viewbook.image}`
                      : NULL_CONSTANTS.BOOK_GROUP_IMAGE
                  }
                  text={viewbook.views + ' lượt đọc'}
                  title={viewbook.title}
                  height="205px"
                  bgColor="green"
                ></DisplayImg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
