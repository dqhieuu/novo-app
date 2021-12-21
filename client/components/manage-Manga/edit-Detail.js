import { useContext, useState, useEffect } from 'react';
import { MangaContext } from '../../context/manga-Context';
import NULL_CONSTANTS from '../../utilities/null-Constants';
import {
  SortableContainer,
  SortableElement,
} from 'react-sortable-hoc';
import { arrayMove } from 'react-sortable-hoc';
import Image from 'next/image';
import TagInput from '../upload-Manga/reactTag';
import GenRenderList from '../genre-Render/genreRenderList';
import uploadImages from '../../utilities/upload-Images';
import { fetchAuth } from '../../utilities/fetchAuth';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { UserContext } from '../../context/user-Context';
function EditDetail({ manga, bookGroupId }) {
  const { server } = useContext(MangaContext);

  const [genres, setGenres] = useState([]);
  const [images, setImages] = useState([]);
  const [bookEdit, setBookEdit] = useState({
    name: manga.name,
    genres: [],
    alias: manga.alias,
    description: manga.description,
    authors: manga.authors.map((author) => {
      return author.id;
    }),
  });
  const router = useRouter();
  const { userInfo } = useContext(UserContext);
  const updateAuthor = (authorList) => {
    setBookEdit({ ...bookEdit, authors: authorList });
  };
  const updateBookGenres = (editGenres) => {
    setBookEdit({ ...bookEdit, genres: editGenres });
  };
  useEffect(() => {
    const coverLinks = manga.coverArts.map((cover) => {
      return {
        status: 'finished',
        fileURL: `${server}/image/${cover.path}`,
        id: cover.id,
      };
    });
    setImages(coverLinks);
  }, []);
  const deleteBookGroup = () => {
    fetchAuth({
      url: `${server}/auth/book/${bookGroupId}`,
      method: 'DELETE',
    })
      .then(() => {
        toast.success('Xoá thành công', {
          position: 'bottom-left',
          author: 3000,
        });
        router.replace('/');
      })
      .catch((err) => {
        toast.error('Xoá thất bại! Bạn không đủ quyền', {
          position: 'bottom-left',
          author: 3000,
        });
        router.replace('/');
      });
  };
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
      .map((image) => image.id);

    fetchAuth({
      url: `${server}/auth/book/${bookGroupId}`,
      method: `PATCH`,
      data: {
        name: bookEdit.name,
        alias: bookEdit.alias,
        description: bookEdit.description,

        authors: bookEdit.authors,
        genres: bookEdit.genres,
        coverArts: imagesUploaded ?? null,
        primaryCoverArt: imagesUploaded.length
          ? imagesUploaded[length - 1]
          : null,
      },
    }).then((res) => {
      toast.success(`${res}`, {
        position: 'bottom-left',
        autoClose: 2000,
      });

      router.push(`/manage-Manga/${bookGroupId}`);
    });
  };
  return (
    <div
      className="container"
      style={{ background: '#ecf0f1', borderRadius: '5px' }}
    >
      <h3>{manga.name}</h3>
      <div className="row ">
        <div className="col-lg-3 col-12">
          <div
            style={{
              width: '200px',
              aspectRatio: '3/4',
              overflow: 'hidden',
              borderRadius: '0.75rem',
              position: 'relative',
              border: '5px solid white',
            }}
          >
            <Image
              src={
                images[0]
                  ? images[0].fileURL
                  : NULL_CONSTANTS.BOOK_GROUP_IMAGE
              }
              objectFit="cover"
              layout="fill"
              alt="some description"
            />
          </div>
        </div>
        <div className="col-lg-9 col-12">
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
                  value={bookEdit.name}
                  onChange={(e) =>
                    setBookEdit({
                      ...bookEdit,
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
                <TagInput
                  authors={manga.authors}
                  updateAuthor={updateAuthor}
                ></TagInput>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <label
              htmlFor="mangaAlias"
              className="form-label mt-3"
            >
              *Tên thay thế:
            </label>
            <input
              type="text"
              className="form-control"
              id="mangaAlias"
              placeholder="Nhập các tên thay thế, cách nhau bởi dấu ;"
              name="mangaAlias"
              value={bookEdit.alias}
              onChange={(e) =>
                setBookEdit({
                  ...bookEdit,
                  alias: e.target.value,
                })
              }
            />
            <label htmlFor="" className="mangaTypes">
              Thể loại:
            </label>
          </div>

          <GenRenderList
            updateGenres={updateBookGenres}
            genresChosen={manga?.genres?.map((e) => e.id)}
          ></GenRenderList>
          <div className="mt-3">
            <label htmlFor="mangaDescription">Mô tả:</label>
            <textarea
              name="mangaDescription"
              id="mangaDescription"
              cols="30"
              rows="5"
              className="form-control"
              value={bookEdit.description}
              onChange={(e) =>
                setBookEdit({
                  ...bookEdit,
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
                onClick={() => handleSubmit()}
              >
                Update
              </button>
              <button
                className="btn btn-danger m-2"
                data-bs-toggle="modal"
                data-bs-target="#myModal"
              >
                Xoá truyện
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal fade" id="myModal">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">
                Bạn có muốn xoá không?
              </h4>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body d-flex justify-content-around">
              <button
                type="button"
                className="btn btn-dark"
                data-bs-dismiss="modal"
                onClick={() => deleteBookGroup()}
              >
                Có
              </button>
              <button
                type="button"
                className="btn btn-danger"
                data-bs-dismiss="modal"
              >
                Không
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditDetail;
