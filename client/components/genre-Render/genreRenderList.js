import React, { useEffect, useState } from 'react';
import WEB_CONSTANTS from '../../utilities/constants';

export default function GenRenderList({
  genresChosen,
  updateGenres,
}) {
  const [genres, setGenres] = useState([]);
  const server = WEB_CONSTANTS.SERVER;

  useEffect(() => {
    fetch(`${server}/genre/all`)
      .then((res) => res.json())
      .then((data) => {
        setGenres(
          data.map((elem) => ({
            name: elem.name,
            id: elem.id,
            checked:
              genresChosen?.includes(elem.id) ?? false,
          }))
        );
      });
  }, []);
  const handleCheckbox = (e) => {
    let updatedGenres = [...genres];
    updatedGenres[e.target.value].checked =
      e.target.checked;
    setGenres(updatedGenres);

    const res = updatedGenres
      .filter((genre) => genre.checked)
      .map((genre) => genre.id);
    updateGenres(res);
    //     // res là gì thế
    //     res là cái mảng tạo ra sau khi filter ra các value đã được check, lấy ra id để submid ấy
    //     // thế chạy đang bị lỗi à
    //hay do trùng tên
    // tên gì?
    //à k
    // ok
    //đ biết lỗi ở đâu luôn
  };

  return (
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
  );
}
