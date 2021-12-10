import { useContext, useState, useEffect } from 'react';
import Link from 'next/link';
import { MangaContext } from '../../Context/MangaContext';
import NULL_CONSTANTS from '../../utilities/nullConstants';
import {
  SortableContainer,
  SortableElement,
} from 'react-sortable-hoc';
import { arrayMove } from 'react-sortable-hoc';

function EditDetail({ manga }) {
  const { server } = useContext(MangaContext);

  const [genres, setGenres] = useState([]);
  const [images, setImages] = useState([]);
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
    const coverLinks = manga.coverArts.map(
      (cover) => (cover = `${server}/image/${cover}`)
    );
    setImages(coverLinks);
  }, []);

  const onSortEnd = ({ oldIndex, newIndex }) => {
    setImages(arrayMove(images, oldIndex, newIndex));
  };
  const handleCheckbox = (e) => {
    let updatedGenres = genres.slice();
    updatedGenres[e.target.value].checked =
      e.target.checked;
    setGenres(updatedGenres);
  };

  const SortableListItem = SortableElement(
    ({ image, stt }) => {
      return (
        <div>
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
    return (
      <div className="d-flex flex-wrap border mt-3">
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
  return (
    <div
      className="container"
      style={{ background: '#ecf0f1', borderRadius: '5px' }}
    >
      <h3>{manga.name}</h3>
      <div className="row ">
        <div className="col-lg-3 col-12">
          <img
            src={images[0]}
            width="100%"
            style={{
              border: '5px solid white',
              borderRadius: '5px',
              background: 'white',
            }}
          />
        </div>
        <div className="col-lg-9 col-12">
          <form data-aos="fade-up" className="p-3">
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
                    value={manga.name}
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
                    value={manga.authors[0].name}
                  />
                </div>
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
              <label htmlFor="mangaDescription">
                Mô tả:
              </label>
              <textarea
                name="mangaDescription"
                id="mangaDescription"
                cols="30"
                rows="5"
                className="form-control"
                value={manga.description}
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
                />

                <div className="d-flex justify-content-center mt-3">
                  <SortableList
                    axis={'xy'}
                    images={images}
                    onSortEnd={onSortEnd}
                  ></SortableList>
                </div>
              </div>
            </div>
            <div className="mt-3 d-flex justify-content-between">
              <div>
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
                  Để ảnh mong muốn làm ảnh chính ở đầu tiên
                </label>
              </div>
              <div>
                <button
                  className="btn btn-dark"
                  type="submit"
                >
                  Update
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditDetail;
