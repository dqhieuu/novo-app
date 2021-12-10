import React, {
  useState,
  useMemo,
  useCallback,
} from 'react';

import {
  SortableContainer,
  SortableElement,
} from 'react-sortable-hoc';
import { arrayMove } from 'react-sortable-hoc';
import { useRouter } from 'next/router';
import ChapterNovel from './chapterNovel';

const SortableListItem = SortableElement(
  ({ image, stt }) => {
    return (
      <div className="m-3 border rounded">
        <img
          src={image}
          style={{
            objectFit: 'cover',
            aspectRatio: '3/4',
            width: '150px',
          }}
        />
        <div className="d-flex justify-content-center mt-1">
          {stt}
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
export default function UploadPartTwo({ data, update }) {
  const [images, setImages] = useState([]);
  const [type, setType] = useState('Truyện Tranh');

  const router = useRouter();

  const handlePreviewImg = (e) => {
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
    update('mangaChapter', {
      ...data,
      mangaImages: images,
    });
  };

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
            value={data.chapterName}
            onChange={(e) =>
              update('mangaChapter', {
                ...data,
                chapterName: e.target.value,
              })
            }
          />
        </div>
        <div className="mb-3 mt-3">
          <label className="form-label">Thể loại</label>
          <select
            className="form-select"
            onChange={(e) => {
              setType(e.target.value);
            }}
          >
            <option>Truyện Tranh</option>
            <option>Truyện Chữ</option>
          </select>
        </div>
        {type === 'Truyện Tranh' ? (
          <div className="mb-3 mt-3">
            <label
              htmlFor="chapterImages"
              className="form-label"
            >
              02. Chọn Ảnh:
            </label>
            <input
              type="file"
              className="form-control"
              id="chapterImages"
              multiple
              onChange={handlePreviewImg}
            />
            <SortableList
              axis={'xy'}
              images={images}
              onSortEnd={onSortEnd}
            ></SortableList>
          </div>
        ) : (
          <ChapterNovel />
        )}
      </form>
    </div>
  );
}
