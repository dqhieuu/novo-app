import React, { useState, useEffect } from "react";
import { SortableContainer, SortableElement } from "react-sortable-hoc";
import { arrayMove } from "react-sortable-hoc";
import { useRouter } from "next/router";

const SortableListItem = SortableElement(({ image, stt }) => {
  return (
    <div className="m-3 border rounded">
      <img
        src={image}
        style={{ objectFit: "cover", aspectRatio: "3/4", width: "150px" }}
      />
      <div className="d-flex justify-content-center mt-1">{stt}</div>
    </div>
  );
});

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
export default function UploadPartTwo({ data, name, update }) {
  const [images, setImages] = useState([]);
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
    update("mangaChapter", { ...data, mangaImages: images });
  };
  const handleSubmit = (e) => {
    e.preventDefault();

    setTimeout(() => {
      router.push("/");
    }, 3000);
  };

  return (
    <div>
      <div
        className="offset-lg-2 col-lg-8 col-12 mt-5"
        style={{ background: "#f3f3f3", borderRadius: "5px" }}
      >
        <div className="p-3">
          {" "}
          <p>{name}</p>
          <hr />
          <form onSubmit={handleSubmit}>
            <div className="mb-3 mt-3">
              <label htmlFor="chapterName" className="form-label">
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
                  update("mangaChapter", {
                    ...data,
                    chapterName: e.target.value,
                  })
                }
              />
            </div>
            <div className="mb-3 mt-3">
              <label htmlFor="chapterImages" className="form-label">
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
                axis={"xy"}
                images={images}
                onSortEnd={onSortEnd}
              ></SortableList>
            </div>
            <div className="d-flex justify-content-center mt-3">
              <button type="submit" className="btn btn-primary mt-3">
                Hoàn thành
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
