import React from 'react';
import {
  FaEye,
  FaLine,
  FaLink,
  FaPen,
  FaTrash,
  FaWindowClose,
} from 'react-icons/fa';

function EditChapter() {
  return (
    <div>
      <button className="btn btn-primary mt-3">
        Thêm Chapter
      </button>
      <div className="table-responsive mt-3">
        <table className="table table table-striped table-hover ">
          <thead className="table-dark">
            <tr>
              <th scope="col">Thứ tự</th>
              <th scope="col">Tên Chap</th>
              <th scope="col">Lượt xem</th>
              <th scope="col">Ngày Upload</th>
              <th scope="col">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">1</th>
              <td>Mark</td>
              <td>Otto</td>
              <td>@mdo</td>
              <td>
                <div className="d-flex justify-content-around">
                  <FaPen></FaPen>
                  <FaEye></FaEye>
                  <FaLink></FaLink>
                  <FaWindowClose></FaWindowClose>
                  <FaTrash></FaTrash>
                </div>
              </td>
            </tr>
            <tr>
              <th scope="row">2</th>
              <td>Jacob</td>
              <td>Thornton</td>
              <td>@fat</td>
            </tr>
            <tr>
              <th scope="row">3</th>
              <td>Larry the Bird</td>
              <td>@twitter</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EditChapter;
