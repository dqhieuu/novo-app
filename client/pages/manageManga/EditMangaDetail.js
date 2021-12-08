import React, { useState, useEffect } from 'react';
import {
  SortableContainer,
  SortableElement,
} from 'react-sortable-hoc';
import { arrayMove } from 'react-sortable-hoc';
import EditChapter from '../../components/manageManga/EditChapter';
import EditDetail from '../../components/manageManga/EditDetail';
import MangaInfo from '../../components/manageManga/mangaInfo';
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
const SortableListItem = SortableElement(
  ({ image, stt }) => {
    return (
      <div className="m-3 border rounded ">
        <img
          src={image}
          style={{
            objectFit: 'cover',
            aspectRatio: '3/4',
            width: '150px',
          }}
        />
        <div className="d-flex justify-content-center mt-1">
          {stt + 1}
        </div>
      </div>
    );
  }
);

const SortableList = SortableContainer(({ images }) => {
  return (
    <div
      className="d-flex flex-wrap border mt-3 "
      style={{
        overflow: 'hidden',
        overflowY: 'auto',
        height: '300px',
      }}
    >
      {images.length > 0 &&
        images.map((image, index) => {
          return (
            <SortableListItem
              axis="xy"
              key={index}
              index={index}
              image={image}
              stt={index}
            />
          );
        })}
    </div>
  );
});

export default function EditMangaDetail() {
  const [data, setData] = useState({
    mangaInfo: {
      mangaName: '',
      mangaLanguage: '',
      mangaAuthor: '',

      mangaTypes: [],
      mangaDescription: '',
      mangaCover: [],
      mangaBackground: '',
    },
    mangaChapter: {
      chapterName: '',
      mangaImages: [],
    },
  });
  function update(type, newData) {
    setData((manga) => {
      return { ...data, [type]: newData };
    });
  }
  const [images, setImages] = useState([]);

  const [checkedState, setCheckedState] = useState(
    mangaTypes.reduce(
      (acc, curr) => ((acc[curr] = false), acc),
      {}
    )
  );

  const handlePreviewCover = (e) => {
    const files = e.target.files;
    const arrayFiles = Object.entries(files);
    files.preview = [];
    arrayFiles.map((file) => {
      const fileURL = URL.createObjectURL(file[1]);
      files.preview = [...files.preview, fileURL];
    });
    setImages(files.preview);
  };
  const onSortEnd = ({ oldIndex, newIndex }) => {
    setImages(arrayMove(images, oldIndex, newIndex));
    update('mangaInfo', {
      ...data,
      mangaCover: images,
    });
    update('mangaInfo', {
      ...data,
      mangaMainPrimaryCover: images[images.length - 1],
    });
  };

  const handleCheckbox = (e) => {
    let mangaGenre = [];
    checkedState[e.target.value] = e.target.checked;
    setCheckedState(checkedState);
    for (const genre in checkedState) {
      if (checkedState[genre] == true)
        mangaGenre = [...mangaGenre, genre];
    }
    update('mangaInfo', {
      ...data,
      mangaTypes: mangaGenre,
    });
  };
  return (
    <div
      className="offset-md-2 col-lg-8 col-12 mt-5"
      style={{
        background: '#f3f3f3',
        borderRadius: '5px',
      }}
    >
      <MangaInfo></MangaInfo>
      <div
        style={{ background: '#f3f3f3' }}
        className="mt-5"
      >
        <ul
          className="nav  nav-tabs nav-justified"
          id="myTab"
          role="tablist"
        >
          <li className="nav-item" role="presentation">
            <button
              className="nav-link active"
              id="home-tab"
              data-bs-toggle="tab"
              data-bs-target="#home"
              type="button"
              role="tab"
              aria-controls="home"
              aria-selected="true"
            >
              Sửa thông tin truyện
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className="nav-link"
              id="profile-tab"
              data-bs-toggle="tab"
              data-bs-target="#profile"
              type="button"
              role="tab"
              aria-controls="profile"
              aria-selected="false"
            >
              Quản lý chapter
            </button>
          </li>
        </ul>
        <div className="tab-content ">
          <div
            className="tab-pane active"
            id="home"
            role="tabpanel"
            aria-labelledby="home-tab"
          >
            <form data-aos="fade-up" className="p-3">
              <div className="row">
                <div className="col-lg-8 col-12">
                  <div className="mb-3 mt-3">
                    <label
                      htmlFor="mangaName"
                      className="form-label"
                    >
                      *Tên truyện:
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="mangaName"
                      placeholder="Nhập tên truyện"
                      name="mangaName"
                      value={data.mangaName}
                      onChange={(e) =>
                        update('mangaInfo', {
                          ...data,
                          mangaName: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="mt-3">
                    <label
                      htmlFor="mangaAuthor"
                      className="form-label"
                    >
                      Tác giả:
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="mangaAuthor"
                      placeholder="Nhập tác giả"
                      name="mangaAuthor"
                      value={data.mangaAuthor}
                      onChange={(e) =>
                        update('mangaInfo', {
                          ...data,
                          mangaAuthor: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="mt-3">
                    <label
                      htmlFor=""
                      className="mangaTypes"
                    >
                      Thể loại:
                    </label>
                  </div>
                  <div className="d-flex mt-3 justify-content-between flex-wrap">
                    {mangaTypes.map((mangaType, index) => (
                      <div
                        className="form-check"
                        key={mangaType}
                      >
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={index}
                          name="option1"
                          value={mangaType}
                          onChange={handleCheckbox}
                        />
                        <label className="form-check-label">
                          {mangaType}
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <label htmlFor="mangaDescription">
                      Mô tả:
                    </label>
                    <textarea
                      name="mangaDescription"
                      id="mangaDescription"
                      cols="30"
                      rows="5"
                      className="form-control"
                      value={data.mangaDescription}
                      onChange={(e) =>
                        update('mangaInfo', {
                          ...data,
                          mangaDescription: e.target.value,
                        })
                      }
                    ></textarea>
                  </div>

                  <div className="mt-3"></div>
                </div>
                <div className="col-4">
                  <div className="image-cover d-flex align-items-end"></div>
                </div>
              </div>

              <div data-aos="fade-up" className="col-12">
                <div className="image-cover">
                  <label
                    htmlFor="mangaCover"
                    className="form-label"
                  >
                    *Chọn các ảnh cover:
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    id="mangaCover"
                    multiple
                    onChange={handlePreviewCover}
                  />

                  {images.length > 0 ? (
                    <div className="row ">
                      <div className="col-lg-6 col-12 mt-3">
                        <SortableList
                          axis={'xy'}
                          images={images}
                          onSortEnd={onSortEnd}
                        ></SortableList>
                      </div>
                      <div className="col-lg-6 col-12 mt-3">
                        {' '}
                        <img
                          src={images[images.length - 1]}
                          alt=""
                          width="80%"
                          style={{
                            aspectRatio: '3/4',
                            objectFit: 'cover',
                          }}
                          className="img-thumbnail"
                        />
                      </div>
                    </div>
                  ) : (
                    <div
                      className="mt-1"
                      style={{ textAlign: 'center' }}
                    >
                      <img
                        src="https://www.niadd.com/files/images/def_logo.svg"
                        alt=""
                        width="50%"
                        style={{
                          aspectRatio: '16/9',
                          objectFit: 'cover',
                        }}
                        className="img-thumbnail"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3">
                <label
                  htmlFor=""
                  className="form-label"
                  style={{
                    color: 'red',
                    fontStyle: 'italic',
                  }}
                >
                  Phần * là bắt buộc
                </label>
                <br></br>
                <label
                  htmlFor=""
                  className="form-label"
                  style={{
                    color: 'red',
                    fontStyle: 'italic',
                  }}
                >
                  Để ảnh mong muốn làm ảnh chính ở cuối cùng
                </label>
              </div>
            </form>
            <div className="d-flex justify-content-center">
              <button className="btn btn-outline-primary">
                Hoàn thành
              </button>
            </div>
          </div>
          <div
            className="tab-pane"
            id="profile"
            role="tabpanel"
            aria-labelledby="profile-tab"
          >
            <EditChapter></EditChapter>
          </div>
        </div>
      </div>
    </div>
  );
}
