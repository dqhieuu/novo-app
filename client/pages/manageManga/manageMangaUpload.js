import React, { useContext } from 'react';
import Link from 'next/link';
import { MangaContext } from '../../Context/MangaContext';
import ImgOverlay from '../../components/ImgOverlay';
import DisplayImg from '../../components/displayImg';
import { FaTrash } from 'react-icons/fa';
import MangaInfo from '../../components/manageManga/mangaInfo';
function ManageMangaUpload() {
  const { latestManga } = useContext(MangaContext);
  return (
    <div className="container mt-5">
      <div
        className="row p-3"
        style={{
          background: '#f3f3f3',
          borderRadius: '10px',
        }}
      >
        <div className="col-lg-3 col-6 ">
          <img
            className="rounded-circle"
            src="https://www.niadd.com/files/images/def_logo.svg"
            alt="User avatar"
            style={{ border: '1px solid black' }}
          ></img>
        </div>
        <div className="col-lg-9 col-12 ">
          <h3>Nguyễn Quang Đại Dương</h3>
          <p style={{ fontStyle: 'italic' }}>
            "One day you'll leave this world behind, so live
            a life you will remember!"
          </p>
        </div>
      </div>
      <div
        className="mt-3 row"
        style={{ background: '#f3f3f3' }}
      >
        <div className="col-12 mt-3">
          <div className="d-flex justify-content-between">
            <h5>Truyện của tôi</h5>
            <Link href="/uploadManga/uploadManga">
              <button className="btn btn-primary">
                Upload truyện
              </button>
            </Link>
          </div>
          <hr></hr>
          <div className="mt-3">
            {latestManga
              .slice(0, 3)
              .map((listObject, index) => (
                <div key={index}>
                  <div className="row">
                    <div className="col-12 col-lg-2">
                      <DisplayImg
                        srcImg={listObject.image}
                        text={
                          'Chap ' + listObject.latestChapter
                        }
                        height="200px"
                        bgColor="red"
                      ></DisplayImg>
                    </div>
                    <div className="col-12 col-lg-5">
                      <h5>{listObject.title}</h5>
                      <div className="row">
                        <div className="col-6">
                          <p>
                            {'Ngày được tạo: ' +
                              listObject.lastUpdate}
                          </p>
                          <p>
                            {'Lượt xem: ' +
                              listObject.views}
                          </p>
                        </div>
                        <div className="col-6">
                          <p>
                            {'Cập nhật cuối: ' +
                              listObject.lastUpdate}
                          </p>
                          <p>
                            {'Lượt thích: ' +
                              listObject.views}
                          </p>
                        </div>
                      </div>
                      <div className="d-flex">
                        <Link href="/manageManga/EditMangaDetail">
                          <button className="btn btn-primary me-2">
                            Sửa thông tin
                          </button>
                        </Link>

                        <button className="btn btn-primary">
                          Quản lý chương
                        </button>
                      </div>
                    </div>
                    <div className="col-3 d-flex justify-content-center align-items-start">
                      <button
                        className="btn btn-link"
                        style={{
                          color: 'lightgrey',
                        }}
                      >
                        <FaTrash />
                      </button>
                    </div>
                    <hr />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageMangaUpload;
