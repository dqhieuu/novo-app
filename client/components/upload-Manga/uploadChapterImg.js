import React, { useState } from 'react';
import {
  SortableContainer,
  SortableElement,
} from 'react-sortable-hoc';
import Image from 'next/image';
import { arrayMove } from 'react-sortable-hoc';
import { fetchAuth } from '../../utilities/fetchAuth';
import { toast } from 'react-toastify';

import uploadImages from '../../utilities/upload-Images';
import WEB_CONSTANTS from '../../utilities/constants';
import { useRouter } from 'next/router';
export default function UploadChapterImg({ data }) {
  const router = useRouter();
  const server = WEB_CONSTANTS.SERVER;
  const [images, setImages] = useState([]);
  const handlePreviewChapter = (e) => {
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
  const SortableListItem = SortableElement(
    ({ image, stt }) => {
      console.log(image);

      return (
        <div>
          {image.status === 'uploading' && (
            <div className="spinner-border"></div>
          )}
          {image.status === 'failed' && (
            <div
              style={{ width: '100px', aspectRatio: '3/4' }}
            >
              <Image
                width={100}
                height={100}
                layout="responsive"
                src={
                  'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Crystal_128_error.svg/1024px-Crystal_128_error.svg.png'
                }
                alt=""
              ></Image>
            </div>
          )}
          <div>
            <div
              className="card m-3"
              style={{
                aspectRatio: '3/4',
                width: '150px',
                border: '0.5rem solid white',
              }}
            >
              <Image
                src={image.fileURL}
                objectFit="cover"
                layout="responsive"
                width={'150'}
                height={'200'}
                alt=""
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
      <div
        className="d-flex flex-wrap border mt-3"
        style={{ borderRadius: '0.75rem' }}
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
  const handleSubmit = () => {
    const imagesUploaded = images
      .filter((image) => image.status === 'finished')
      .map((image) => image.id.id);

    fetchAuth({
      url: `${server}/auth/chapter/images`,
      method: `POST`,
      data: {
        name: data.chapterName,
        bookGroupId: parseInt(data.bookGroupId),
        chapterNumber: parseInt(data.chapterNumber),

        images: imagesUploaded ?? null,
      },
    }).then((res) => {
      toast.success(`Upload thành công`, {
        position: 'bottom-left',
        autoClose: 2000,
      });
      // thế này chứ nhỉ

      router.push(`/chapter/${res.data.id}`);
      // có phải prevent default ko nhỉ, tôi có để dạng form đâu
      // sao ko push dc?
    });
  };

  return (
    <div data-aos="fade-up">
      <div className="image-cover">
        <label htmlFor="mangaCover" className="form-label">
          *Chọn các ảnh chap:
        </label>
        <input
          type="file"
          className="form-control"
          id="mangaCover"
          multiple
          onChange={handlePreviewChapter}
        />

        <div className="row mt-3">
          {images.length > 0 && (
            <div className="col-12">
              <SortableList
                axis={'xy'}
                images={images}
                onSortEnd={onSortEnd}
              ></SortableList>
            </div>
          )}
        </div>
      </div>
      <div className="mt-3 d-flex justify-content-center">
        <button
          className="btn btn-dark"
          onClick={() => handleSubmit()}
        >
          Submit
        </button>
      </div>
    </div>
  );
}
