import React, { useState, useEffect } from "react";

const mangaTypes = [
  "Action",
  "Adult",
  "Adventure",
  "Anime",
  "Award Winning",
  "Comedy",
  "Cooking",
  "Demons",
  "Doujinshi",
  "Drama",
  "Ecchi",
  "Fantasy",
  "Gender bender",
  "Harem",
  "Historical",
  "Horror",
  "Josei",
  "Live Action",
  "Magic",
  "Manhua",
  "Manhwa",
  "Martial Arts",
  "Mature",
];

export default function UploadPartOne({ data, update }) {
  const [cover, setCover] = useState();
  const [background, setBackGround] = useState();
  const [checkedState, setCheckedState] = useState(
    mangaTypes.reduce((acc, curr) => ((acc[curr] = false), acc), {})
  );

  useEffect(() => {
    return () => {
      background && URL.revokeObjectURL(background.preview);
    };
  }, [background]);
  useEffect(() => {
    return () => {
      cover && URL.revokeObjectURL(cover.preview);
    };
  }, [cover]);
  const handlePreviewBackground = (e) => {
    const file = e.target.files[0];
    file.preview = URL.createObjectURL(file);
    setBackGround(file);
    update("mangaInfo", { ...data, mangaBackground: file.preview });
  };

  const handlePreviewCover = (e) => {
    const file = e.target.files[0];
    file.preview = URL.createObjectURL(file);
    setCover(file);
    update("mangaInfo", { ...data, mangaCover: file.preview });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (data.mangaName.length <= 0) {
      alert("Vui lòng nhập tên truyện!");
      return;
    } else if (data.mangaTypes.length === 0) {
      alert("Vui lòng chọn ít nhất một thể loại");
      return;
    } else if (data.mangaCover.length === 0) {
      alert("Vui lòng chọn ảnh cover");
      return;
    } else {
      alert("Nhập dữ liệu thành công");
      console.log(data);
    }
  };


  const handleCheckbox = (e) => {
    let mangaGenre = [];
    checkedState[e.target.value] = e.target.checked;
    setCheckedState(checkedState);
    for (const genre in checkedState) {
      if (checkedState[genre] == true) mangaGenre = [...mangaGenre, genre];
    }
    update("mangaInfo", {
      ...data,
      mangaTypes: mangaGenre,
    });
  };
  return (
    <div>
      <div
        className="offset-md-2 col-8 mt-5"
        style={{ background: "#f3f3f3", borderRadius: "5px" }}
      >
        <form action="" className="p-3" onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-8">
              <div className="mb-3 mt-3">
                <label htmlFor="mangaName" className="form-label">
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
                    update("mangaInfo", {
                      ...data,
                      mangaName: e.target.value,
                    })
                  }
                />
              </div>
              
              <div className="mt-3">
                <label htmlFor="mangaAuthor" className="form-label">
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
                    update("mangaInfo", {
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
                    <label className="form-check-label">{mangaType}</label>
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
                  value={data.mangaDescription}
                  onChange={(e) =>
                    update("mangaInfo", {
                      ...data,
                      mangaDescription: e.target.value,
                    })
                  }
                ></textarea>
              </div>
              <div className="mt-3">
                <label htmlFor="" style={{ color: "red", fontStyle: "italic" }}>
                  Lưu ý: Phần * là bắt buộc
                </label>
              </div>
            </div>
            <div className="col-4">
              <div className="image-cover">
                <label htmlFor="mangaCover" className="form-label">
                  *Chọn ảnh cover:
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="mangaCover"
                  onChange={handlePreviewCover}
                />
                {cover ? (
                  <div className="d-flex justify-content-center mt-3">
                    <img
                      src={cover.preview}
                      alt=""
                      width="80%"
                      style={{ aspectRatio: "3/4" }}
                      className="img-thumbnail"
                    />
                  </div>
                ) : (
                  <div className="d-flex justify-content-center mt-3">
                    <img
                      src="https://www.niadd.com/files/images/def_logo.svg"
                      alt=""
                      width="80%"
                      style={{ aspectRatio: "3/4" }}
                      className="img-thumbnail"
                    />
                  </div>
                )}
              </div>
              <div className="image-cover">
                <label htmlFor="mangaBackGround" className="form-label">
                  Chọn ảnh bìa:
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="mangaBackGround"
                  onChange={handlePreviewBackground}
                />
                {background ? (
                  <div className="d-flex justify-content-center mt-3">
                    <img
                      src={background.preview}
                      alt=""
                      width="80%"
                      style={{ aspectRatio: "16/9" }}
                      className="img-thumbnail"
                    />
                  </div>
                ) : (
                  <div className="d-flex justify-content-center mt-3">
                    <img
                      src="https://www.niadd.com/files/images/def_logo.svg"
                      alt=""
                      width="80%"
                      style={{ aspectRatio: "16/9" }}
                      className="img-thumbnail"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="d-flex mt-3">
            <button type="submit" className="btn btn-primary mt-3">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
