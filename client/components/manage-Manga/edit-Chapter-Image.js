import { useContext, useState, useEffect } from 'react';
import { MangaContext } from '../../context/manga-Context';
import {
  SortableContainer,
  SortableElement,
} from 'react-sortable-hoc';
import { arrayMove } from 'react-sortable-hoc';
import Image from 'next/image';
import { useRouter } from 'next/router';
import uploadImages from '../../utilities/upload-Images';
import { fetchAuth } from '../../utilities/fetchAuth';
import { toast } from 'react-toastify';
import { FaAngry, FaSpinner } from 'react-icons/fa';
export default function EditChapterImage({ chapter, id }) {
  const { server } = useContext(MangaContext);
  const [images, setImages] = useState([]);
  const [chapterEdit, setChapterEdit] = useState({
    name: chapter.name,
    chapterNumber: chapter.chapterNumber,
    images: chapter.images.map((image) => {
      return image.id;
    }),
  });
  const router = useRouter();
  useEffect(() => {
    const coverLinks = chapter.images.map((image) => {
      return {
        status: 'finished',
        fileURL: `${server}/image/${image.path}`,
        id: image.id,
      };
    });
    setImages(coverLinks);
  }, []);
  const handleSubmit = () => {
    const imagesUploaded = images
      .filter((image) => image.status === 'finished')
      .map((image) => image.id);

    fetchAuth({
      url: `${server}/auth/chapter/images/${id}`,
      method: `PATCH`,
      data: {
        name: chapterEdit.name,
        chapterNumber: chapterEdit.chapterNumber,

        images: imagesUploaded ?? null,
      },
    }).then((res) => {
      toast.success(`Cập nhật thành công`, {
        position: 'bottom-left',
        autoClose: 2000,
      });

      router.push(`/chapter/${id}`);
    });
  };
  const handlePreviewChapterImage = (e) => {
    const files = e.target.files;

    const arrayFiles = Object.entries(files);
    const preview = [...images];

    const preUploadImageCount = preview.length;
    arrayFiles.map((file) => {
      const fileURL = URL.createObjectURL(file[1]);
      preview.push({
        status: 'uploading',
        fileURL,
        id: 0,
      });
    });

    setImages(preview);

    arrayFiles.map((file, uploadIndex) => {
      uploadImages('chapter-image', file[1], (id) => {
        const updated = [...preview];
        const index = uploadIndex + preUploadImageCount;
        if (id) {
          updated[index].status = 'finished';
          updated[index].id = id.id;
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
      return (
        <div>
          {image.status === 'uploading' ? (
            <div className="m-2">
              <button className="btn btn-dark">
                <FaSpinner></FaSpinner>Loading
              </button>
            </div>
          ) : image.status === 'failed' ? (
            <div className="m-2">
              <button className="btn btn-danger">
                <FaAngry></FaAngry>Error
              </button>
            </div>
          ) : (
            <div>
              <div
                className="card m-3"
                style={{
                  aspectRatio: '3/4',
                  width: '150px',
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
          )}
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
  return (
    <div className="p-3" data-aos="flip-left">
      <div className="row">
        <div className="mb-3 mt-3 col-6">
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
            value={chapterEdit.name}
            onChange={(e) =>
              setChapterEdit({
                ...chapterEdit,
                name: e.target.value,
              })
            }
          />
        </div>
        <div className="mb-3 mt-3 col-6">
          <label
            htmlFor="chapterName"
            className="form-label"
          >
            02. STT:
          </label>
          <input
            type="text"
            className="form-control"
            id="chapterName"
            placeholder="Nhập STT chap"
            name="chapterNumber"
            value={chapterEdit.chapterNumber}
            onChange={(e) =>
              setChapterEdit({
                ...chapterEdit,
                chapterNumber: e.target.value,
              })
            }
          />
        </div>
      </div>

      <div className="mb-3 mt-3">
        <label
          htmlFor="chapterImages"
          className="form-label"
        >
          03. Chọn Ảnh:
        </label>
        <input
          type="file"
          className="form-control"
          id="mangaCover"
          multiple
          onChange={handlePreviewChapterImage}
        />

        <div className="d-flex justify-content-center mt-3">
          <SortableList
            axis={'xy'}
            images={images}
            onSortEnd={onSortEnd}
          ></SortableList>
        </div>
      </div>
      <div className="mt-3 d-flex justify-content-center">
        <button
          className="btn btn-dark"
          onClick={() => handleSubmit()}
        >
          {' '}
          Update
        </button>
      </div>
    </div>
  );
}
