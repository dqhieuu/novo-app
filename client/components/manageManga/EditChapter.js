import React from 'react';
import {
  FaEye,
  FaLine,
  FaLink,
  FaPen,
  FaTrash,
  FaWindowClose,
} from 'react-icons/fa';
import Link from 'next/link';
function EditChapter({ manga }) {
  return (
    <div>
      <button className="btn btn-dark mt-3">
        Thêm Chapter
      </button>
      <div className="table-responsive mt-3">
        <table className="table table table-striped table-hover ">
          <thead className="table-dark">
            <tr>
              <th scope="col">Thứ tự</th>
              <th scope="col">Tên Chap</th>
              <th scope="col">Ngày đăng</th>

              <th scope="col">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {manga.chapters.map((chapter) => (
              <tr>
                <th scope="row">
                  Chapter {chapter.chapterNumber}
                </th>
                <td>
                  {chapter.name ? chapter.name : 'null'}
                </td>
                <td>{chapter.timePosted}</td>

                <td>
                  <div className="d-flex justify-content-around">
                    <Link
                      href={`/editChapter/${chapter.id}`}
                    >
                      <FaPen></FaPen>
                    </Link>

                    <Link href={`/chapters/${chapter.id}`}>
                      <FaEye></FaEye>
                    </Link>
                    <FaLink></FaLink>

                    <FaTrash
                      data-bs-toggle="modal"
                      data-bs-target="#myModal"
                    ></FaTrash>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

export default EditChapter;
