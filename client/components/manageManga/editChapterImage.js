import { useContext, useState, useEffect } from 'react';
import Link from 'next/link';
import { MangaContext } from '../../Context/MangaContext';
import NULL_CONSTANTS from '../../utilities/nullConstants';
import {
  SortableContainer,
  SortableElement,
} from 'react-sortable-hoc';
import { arrayMove } from 'react-sortable-hoc';
export default function EditChapterImage({ chapter }) {
  const { server } = useContext(MangaContext);
  const [images, setImages] = useState([]);
  const onSortEnd = ({ oldIndex, newIndex }) => {
    setImages(arrayMove(images, oldIndex, newIndex));
  };
  useEffect(() => {
    const arr = chapter.images.map(
      (image) => (image = `${server}/image/${image}`)
    );
    setImages(arr);
  }, []);
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
    <div className="p-3" data-aos="flip-left">
      <form>
        <div className="mb-3 mt-3">
          <label
            htmlFor="chapterName"
            className="form-label"
          >
            01. Nhập tên Chapter:
          </label>
          <input
            type="text"
            className="form-control"
            id="chapterName"
            placeholder="Nhập tên Chap ở đây"
            name="chapterName"
            value={chapter.name}
          />
        </div>

        <div className="mb-3 mt-3">
          <label
            htmlFor="chapterImages"
            className="form-label"
          >
            02. Chọn Ảnh:
          </label>

          <SortableList
            axis={'xy'}
            images={images}
            onSortEnd={onSortEnd}
          ></SortableList>
        </div>
        <div className="mt-3 d-flex justify-content-center">
          <button className="btn btn-dark"> Update</button>
        </div>
      </form>
    </div>
  );
}
