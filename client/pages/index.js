import Head from 'next/head';

import Link from 'next/link';
import { useContext } from 'react';
import { MangaContext } from '../Context/MangaContext';
import DisplayImg from '../components/displayImg';
import ImgOverlay from '../components/ImgOverlay';
import '../styles/Home.module.css';
import { FaBeer } from 'react-icons/fa';

export default function Home() {
  const { listObjects } = useContext(MangaContext);
  function sortObjectByKey(key) {
    let arrSorted = [];
    if (key == listObjects.lastUpdate) {
      arrSorted = Object.entries(listObjects).sort(
        (a, b) =>
          (new Date(a[1].lastUpdate) >
            new Date(b[1].lastUpdate) &&
            -1) ||
          1
      );
    } else
      arrSorted = Object.entries(listObjects).sort(
        (a, b) => (a[1].key > b[1].key && -1) || 1
      );
    return arrSorted;
  }
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
        {listObjects.slice(0, 12).map((listObject) => (
          <Link
            href={'/mangas/' + listObject.id}
            key={listObject.id}
          >
            <div
              className="col-6 col-lg-2"
              data-aos="fade-up"
            >
              {' '}
              <DisplayImg
                srcImg={listObject.imgSrc}
                size={2}
                text={'Chap ' + listObject.chapter}
                title={listObject.title}
                height="282px"
                bgColor="red"
              ></DisplayImg>
            </div>
          </Link>
        ))}
      </div>
      {listObjects.length ? (
        <div className="row mt-5" data-aos="fade-up">
          <div className="col-12 col-lg-6 mt-1">
            <ImgOverlay
              view={`${listObjects[4].views} lượt đọc`}
              srcImg={listObjects[4].imgSrc}
              description={listObjects[4].description}
              title={listObjects[4].title}
            ></ImgOverlay>
          </div>
          <div className="col-12 col-lg-6 mt-1">
            <ImgOverlay
              view={`${listObjects[1].views} lượt đọc`}
              srcImg={listObjects[1].imgSrc}
              description={listObjects[1].description}
              title={listObjects[1].title}
            ></ImgOverlay>
          </div>
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
            TRUYỆN MỚI
          </h5>
          <div className="row">
            {sortObjectByKey(listObjects.lastUpdate)
              .slice(0, 8)
              .map((listObject) => (
                <div className="col-sm-6">
                  <div
                    className="row"
                    data-aos="fade-right"
                  >
                    <div className="col-6">
                      <DisplayImg
                        srcImg={listObject[1].imgSrc}
                        text={
                          `${Math.floor(
                            (new Date().getTime() -
                              new Date(
                                listObject[1].lastUpdate
                              ).getTime()) /
                              (1000 * 60 * 60 * 24)
                          )}` + ' ngày trước'
                        }
                        height="260px"
                        bgColor="#ff7043"
                      ></DisplayImg>
                    </div>
                    <div className="col-6">
                      <p style={{ color: '#ff7043' }}>
                        {listObject[1].title}
                      </p>
                      <p>{listObject[1].views} lượt đọc</p>
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
                            Chap {listObject[1].chapter}
                          </p>
                        </Link>

                        <Link href="/">
                          <p
                            className="border-bottom"
                            style={{
                              listStyleType: 'none',
                            }}
                          >
                            Chap {listObject[1].chapter - 1}
                          </p>
                        </Link>

                        <Link href="/">
                          <p
                            className="border-bottom"
                            style={{
                              listStyleType: 'none',
                            }}
                          >
                            Chap {listObject[1].chapter - 2}
                          </p>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
        <div className="col-sm-4">
          <h5
            style={{
              borderLeft: '5px solid green',
              color: 'green',
            }}
            className="ps-2 mt-5"
          >
            TOP TUẦN
          </h5>

          {sortObjectByKey(listObjects.views)
            .slice(0, 3)
            .map((listObject) => (
              <div className="col-12" data-aos="fade-left">
                {' '}
                <DisplayImg
                  srcImg={listObject[1].imgSrc}
                  text={'Chap ' + listObject[1].chapter}
                  title={listObject[1].title}
                  height="205px"
                  bgColor="green"
                ></DisplayImg>
              </div>
            ))}
        </div>
      </div>
      <h5
        style={{
          borderLeft: '5px solid purple',
          color: 'purple',
        }}
        className="ps-2 mt-5"
      >
        ĐỪNG BỎ LỠ
      </h5>
      <div className="row">
        {listObjects.slice(0, 6).map((listObject) => (
          <div
            className="col-6 col-lg-2"
            data-aos="fade-up"
          >
            {' '}
            <DisplayImg
              bgColor="purple"
              srcImg={listObject.imgSrc}
              text={'Chap ' + listObject.chapter}
              title={listObject.title}
              height="282px"
            ></DisplayImg>
          </div>
        ))}
      </div>
    </div>
  );
}
