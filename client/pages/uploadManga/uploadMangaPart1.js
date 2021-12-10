import React, {
  useState,
  useEffect,
  useContext,
} from 'react';
import {
  SortableContainer,
  SortableElement,
} from 'react-sortable-hoc';
import { MangaContext } from '../../Context/MangaContext';
import { arrayMove } from 'react-sortable-hoc';
import uploadImages from '../../utilities/uploadImages';
import NULL_CONSTANTS from '../../utilities/nullConstants';

export default function UploadPartOne() {
  const { server } = useContext(MangaContext);

  const [genres, setGenres] = useState([]);
  const [images, setImages] = useState([]);
  const [newBook, setnewBook] = useState({
    name: '',
    description: '',
    authors: [],
    coverArts: [],
    genres: '',
  });
  useEffect(() => {
    fetch(`${server}/genre/all`)
      .then((res) => res.json())
      .then((data) => {
        setGenres(
          data.map((elem) => ({
            name: elem.name,
            id: elem.id,
            checked: false,
          }))
        );
      });
  }, []);

  const handlePreviewCover = (e) => {
    const files = e.target.files;
    const arrayFiles = Object.entries(files);
    const preview = [];

    arrayFiles.map((file) => {
      const fileURL = URL.createObjectURL(file[1]);
      preview.push({
        status: 'uploading',
        fileURL,
        id: 0,
      });
    });
    setImages(preview);

    arrayFiles.map((file, index) => {
      uploadImages('chapter-image', file[1], (id) => {
        const updated = [...preview];
        console.log(updated, images);
        if (id) {
          updated[index].status = 'finished';
          updated[index].id = id;
        } else {
          updated[index].status = 'failed';
        }
        setImages(updated);
      });
    });
  };

  const onSortEnd = ({ oldIndex, newIndex }) => {
    setImages(arrayMove(images, oldIndex, newIndex));
  };
  const handleCheckbox = (e) => {
    let updatedGenres = genres.slice();
    updatedGenres[e.target.value].checked =
      e.target.checked;
    setGenres(updatedGenres);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
  };
  const SortableListItem = SortableElement(
    ({ image, stt }) => {
      return (
        <div>
          {image.status === 'uploading' && (
            <div className="spinner-border"></div>
          )}
          {image.status === 'failed' && (
            <div>
              <img
                src="https://www.freeiconspng.com/uploads/error-icon-4.png"
                width="20%"
              ></img>
            </div>
          )}
          <div>
            <div className="card m-3">
              <img
                src={image}
                style={{
                  objectFit: 'cover',
                  aspectRatio: '3/4',
                  width: '150px',
                }}
                className="card-img-top"
              />
              <div className="card-img-overlay">
                <div className="d-flex justify-content-between mt-1">
                  <p className="card-title">
                    <span className="badge bg-primary">
                      {stt + 1}
                    </span>
                  </p>
                  <div>
                    <button
                      className="btn btn-danger"
                      onClick={() => {
                        let updated = [...images];
                        updated.splice(stt, 1);
                        setImages(updated);
                      }}
                    >
                      X
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  );

  const SortableList = SortableContainer(({ images }) => {
    console.log(images);
    return (
      <div className="d-flex flex-wrap border mt-3">
        {images.length > 0 &&
          images.map((image, index) => {
            return (
              <SortableListItem
                axis="xy"
                key={index}
                index={index}
                image={image.fileURL}
                stt={index}
              />
            );
          })}
      </div>
    );
  });
  const handleAuthor = (e) => {
    const listAuthor = e.target.value;
    setnewBook({
      ...newBook,
      authors: listAuthor.split(','),
    });
    console.log(newBook.authors);
  };
  return (
    <div>
      <div>
        <form
          data-aos="fade-up"
          className="p-3"
          onSubmit={handleSubmit}
        >
          <div className="row">
            <div className="col-lg-6 col-12">
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
                  value={newBook.name}
                  onChange={(e) =>
                    setnewBook({
                      ...newBook,
                      name: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="col-lg-6 col-12">
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
                  value={newBook.authors}
                  onChange={handleAuthor}
                />
              </div>
              <label
                htmlFor=""
                className="form-label"
                style={{
                  color: 'red',
                  fontStyle: 'italic',
                }}
              >
                Tên các tác giả cách nhau bởi một dấu phảy
              </label>
            </div>
          </div>
          <div className="mt-3">
            <label htmlFor="" className="mangaTypes">
              Thể loại:
            </label>
          </div>
          <div className="d-flex mt-3 justify-content-between flex-wrap">
            {genres.map((genre, index) => (
              <div className="form-check" key={genre.id}>
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={genre.checked}
                  onChange={handleCheckbox}
                  value={index}
                />
                <label className="form-check-label">
                  {genre.name}
                </label>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <label htmlFor="mangaDescription">Mô tả:</label>
            <textarea
              name="mangaDescription"
              id="mangaDescription"
              cols="30"
              rows="5"
              className="form-control"
              value={newBook.description}
              onChange={(e) =>
                setnewBook({
                  ...newBook,
                  description: e.target.value,
                })
              }
            ></textarea>
          </div>

          <div data-aos="fade-up">
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

              <div className="row mt-3">
                <div className="col-9">
                  <SortableList
                    axis={'xy'}
                    images={images}
                    onSortEnd={onSortEnd}
                  ></SortableList>
                </div>
                <div className="col-3">
                  <img
                    src={
                      images.length != 0
                        ? `${
                            images[images.length - 1]
                              .fileURL
                          }`
                        : NULL_CONSTANTS.BOOK_GROUP_IMAGE
                    }
                    width={'100%'}
                    style={{
                      border: '1px solid lightgrey',
                    }}
                  />
                </div>
              </div>
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
          <div className="form-footer d-flex justify-content-center">
            <button className="btn btn-dark" type="submit">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
