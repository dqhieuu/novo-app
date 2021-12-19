import React, { useState } from 'react';
import {
  FaEye,
  FaLink,
  FaPen,
  FaTrash,
} from 'react-icons/fa';
import Link from 'next/link';
import { fetchAuth } from '../../utilities/fetchAuth';
import WEB_CONSTANTS from '../../utilities/constants';
import { toast } from 'react-toastify';
function EditChapter({ manga, bookGroupId }) {
  const [deletedId, setDeletedId] = useState(0);
  const server = WEB_CONSTANTS.SERVER;
  function deleteChapter(id) {
    fetchAuth({
      url: `${server}/auth/chapter/${id}`,
      method: 'DELETE',
      data: {},
    }).then((res) => {
      toast.success('Xoá thành công', {
        position: 'bottom-left',
        autoClose: 3000,
      });
    });
  }
  return (
    <div>
      <Link
        href={`/upload-Chapter/${bookGroupId}`}
        passHref
      >
        <button className="btn btn-dark mt-3">
          Thêm Chapter
        </button>
      </Link>

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
            {manga.chapters.map((chapter, index) => (
              <tr key={index}>
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
                      href={`/edit-Chapter/${chapter.id}`}
                      passHref
                    >
                      <FaPen></FaPen>
                    </Link>

                    <Link
                      href={`/chapter/${chapter.id}`}
                      passHref
                    >
                      <FaEye></FaEye>
                    </Link>
                    <FaLink></FaLink>

                    <FaTrash
                      data-bs-toggle="modal"
                      data-bs-target="#myModal"
                      onClick={() =>
                        setDeletedId(chapter.id)
                      }
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
                onClick={() => deleteChapter(deletedId)}
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