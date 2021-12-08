import React from 'react';

function EditDetail({ data, update }) {
  return (
    <div>
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
              <label htmlFor="" className="mangaTypes">
                Thể loại:
              </label>
            </div>
            <div className="d-flex mt-3 justify-content-between flex-wrap">
              {mangaTypes.map((mangaType, index) => (
                <div className="form-check" key={mangaType}>
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
  );
}

export default EditDetail;
