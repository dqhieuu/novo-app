import React, {
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  arrayMove,
  SortableContainer,
  SortableElement,
} from 'react-sortable-hoc';
import { MangaContext } from '../../context/manga-Context';
import { UserContext } from '../../context/user-Context';
import uploadImages from '../../utilities/upload-Images';
import NULL_CONSTANTS from '../../utilities/null-Constants';
import Image from 'next/image';
import TagInput from '../../components/upload-Manga/reactTag';
import { fetchAuth } from '../../utilities/fetchAuth';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { FaAngry } from 'react-icons/fa';
import ScrollButton from '../../utilities/scrollButton';

export default function UploadManga() {
  const { server } = useContext(MangaContext);
  const { listAuthorsId } = useContext(UserContext);
  const [genres, setGenres] = useState([]);
  const [images, setImages] = useState([]);
  const router = useRouter();
  const [authorAvatar, setAuthorAvatar] = useState({});
  const [newAuthor, setNewAuthor] = useState({
    name: '',
    alias: '',
    description: '',
    avatarId: 0,
  });
  const [newBook, setnewBook] = useState({
    name: '',
    alias: '',
    description: '',
    coverArts: [],
    genres: [],
    authors: [],
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
  const updateAuthor = (authorList) => {
    setnewBook({ ...newBook, authors: authorList });
  };
  const handlePreviewAvatar = (e) => {
    const file = e.target.files[0];
    const fileURL = URL.createObjectURL(file);
    const preview = {
      status: 'uploading',
      fileURL,
      id: 0,
    };
    setAuthorAvatar(preview);
    uploadImages('author-avatar', file, (res) => {
      if (res) {
        preview.id = res.id;
        preview.status = 'finished';
      } else {
        preview.status = 'failed';
      }
      setAuthorAvatar(preview);
    });
  };
  function authorSubmit(e) {
    e.preventDefault();
    fetchAuth({
      url: `${server}/auth/author`,
      method: 'POST',
      data: {
        name: newAuthor.name,
        avatarId: authorAvatar.id ?? null,
        alias: newAuthor.alias ?? null,
        description: newAuthor.description ?? null,
      },
    })
      .then((res) => {
        toast.success('Upload thành công', {
          position: 'bottom-left',
          autoClose: 2000,
        });
        router.replace('/upload-Manga/upload-Manga');
      })
      .catch((err) => {
        toast.error(`${err}`, {
          position: toast.POSITION.TOP_LEFT,
          autoClose: 3000,
        });
      });
  }
  const handlePreviewCover = (e) => {
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
      uploadImages('cover-art', file[1], (id) => {
        const updated = [...preview];
        const index = uploadIndex + preUploadImageCount;

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
    let updatedGenres = [...genres];
    updatedGenres[e.target.value].checked =
      e.target.checked;
    setGenres(updatedGenres);
    const res = updatedGenres
      .filter((genre) => genre.checked)
      .map((genre) => genre.id);
    setnewBook({ ...newBook, genres: res });
  };
  const handleSubmit = (e) => {
    const imagesUploaded = images
      .filter((image) => image.status === 'finished')
      .map((image) => image.id.id);

    e.preventDefault();
    fetchAuth({
      url: `${server}/auth/book`,
      method: `POST`,
      data: {
        name: newBook.name,
        alias: newBook.alias,
        description: newBook.description,
        authors: listAuthorsId,
        genres: newBook.genres,
        coverArts: imagesUploaded ?? null,
        primaryCoverArt: imagesUploaded.length
          ? imagesUploaded[length - 1]
          : null,
      },
    }).then((res) => {
      toast.success(`Upload thành công`, {
        position: 'bottom-left',
        autoClose: 2000,
      });

      router.replace(`/manage-Manga/${res.data.id}`);
    });
  };
  const SortableListItem = SortableElement(
    ({ image, stt }) => {
      return (
        <div>
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
              {image.status === 'uploading' ||
                (image.status === 'failed' && (
                  <div
                    style={{
                      position: 'absolute',
                      zIndex: '20',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#00000038',
                    }}
                  >
                    {image.status === 'uploading' ? (
                      <div
                        className="spinner-border text-light"
                        role="status"
                      >
                        <span className="visually-hidden">
                          Loading...
                        </span>
                      </div>
                    ) : (
                      <div className="m-2">
                        <button className="btn btn-danger">
                          <FaAngry />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              <div
                className="card-img-overlay"
                style={{
                  zIndex: '21',
                }}
              >
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
      className="offset-md-2 col-lg-8 col-12 mt-5"
      style={{
        background: '#f3f3f3',
        borderRadius: '0.75rem',
        boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px',
      }}
    >
      <h3 className="d-flex justify-content-center mt-3">
        Thông tin truyện
      </h3>
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
                  required
                />
              </div>
              <div className="mb-3 mt-3">
                <label
                  htmlFor="mangaName"
                  className="form-label"
                >
                  Tên thay thế:
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="mangaName"
                  placeholder="Nhập các tên thay thế"
                  name="mangaName"
                  value={newBook.alias}
                  onChange={(e) =>
                    setnewBook({
                      ...newBook,
                      alias: e.target.value,
                    })
                  }
                />
                <label
                  htmlFor=""
                  className="form-label mt-2"
                  style={{
                    fontStyle: 'italic',
                    fontSize: '1rem',
                  }}
                >
                  Tên thay thế cách nhau bởi một dấu ;
                </label>
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
                <TagInput
                  updateAuthor={updateAuthor}
                ></TagInput>
                <div>
                  <button
                    className="btn btn-dark mt-2"
                    data-bs-toggle="modal"
                    data-bs-target="#addAuthor"
                  >
                    Tạo tác giả mới
                  </button>
                </div>
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
                  name={genre.name}
                />
                <label
                  className="form-check-label"
                  name={genre.name}
                >
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
                accept="image/*"
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
                  <div
                    style={{
                      border: '1px solid lightgrey',
                      width: '100%',
                      aspectRatio: '3/4',
                      overflow: 'hidden',
                      borderRadius: '0.75rem',
                      position: 'relative',
                    }}
                  >
                    {' '}
                    <Image
                      src={
                        images.length != 0
                          ? `${
                              images[images.length - 1]
                                .fileURL
                            }`
                          : NULL_CONSTANTS.BOOK_GROUP_IMAGE
                      }
                      alt=""
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
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
      <div
        className="modal"
        id="addAuthor"
        aria-labelledby="addAuthor"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5
                className="modal-title"
                id="exampleModalLabel"
              >
                Thêm tác giả
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={authorSubmit}>
                <div className="mb-3 mt-3">
                  <label className="form-label">
                    Tên tác giả:
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="authorName"
                    placeholder="Nhập tên tác giả"
                    name="authorName"
                    value={newAuthor.name}
                    onChange={(e) =>
                      setNewAuthor({
                        ...newAuthor,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    Tên thay thế:
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="listAuthors"
                    placeholder="Nhập các tên thay thế, cách nhau bởi dấu ;"
                    name="listAuthors"
                    value={newAuthor.alias}
                    onChange={(e) =>
                      setNewAuthor({
                        ...newAuthor,
                        alias: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    Mô tả:
                  </label>
                  <textarea
                    className="form-control"
                    name="description"
                    id="description"
                    rows="3"
                    value={newAuthor.description}
                    onChange={(e) =>
                      setNewAuthor({
                        ...newAuthor,
                        description: e.target.value,
                      })
                    }
                  ></textarea>
                </div>
                <div className="mb-3">
                  <label htmlFor="" className="form-label">
                    Ảnh tác giả
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={handlePreviewAvatar}
                    accept="image/*"
                  />
                  <div className="mt-3 d-flex justify-content-center">
                    <div
                      style={{
                        width: '200px',
                        aspectRatio: '3/4',
                        position: 'relative',
                        borderRadius: '0.75rem',
                        overflow: 'hidden',
                      }}
                    >
                      <Image
                        src={
                          authorAvatar.fileURL
                            ? authorAvatar.fileURL
                            : NULL_CONSTANTS.AVATAR
                        }
                        alt="author Avatar"
                        objectFit="cover"
                        layout="fill"
                      ></Image>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-dark"
                  data-bs-dismiss="modal"
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <ScrollButton></ScrollButton>
    </div>
  );
}
