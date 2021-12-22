import React, { useContext, useState } from 'react';
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
import RelativeTimestamp from '../../utilities/to-Relative-Time-stamp';
import { UserContext } from '../../context/user-Context';
import { useRouter } from 'next/router';
function EditChapter({ manga, bookGroupId }) {
  const [deletedId, setDeletedId] = useState(0);
  const { userInfo } = useContext(UserContext);
  const server = WEB_CONSTANTS.SERVER;
  const router = useRouter();
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
      router.push('/manage-Manga/' + bookGroupId);
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
                <td>
                  <RelativeTimestamp>
                    {chapter.timePosted}
                  </RelativeTimestamp>
                </td>

                <td>
                  <div className="d-flex justify-content-around">
                    {chapter.userPosted.id ===
                      userInfo.id && (
                      <Link
                        href={`/edit-Chapter/${chapter.id}`}
                        passHref
                      >
                        <FaPen></FaPen>
                      </Link>
                    )}
                    <Link
                      href={`/chapter/${chapter.id}`}
                      passHref
                    >
                      <FaEye></FaEye>
                    </Link>
                    <FaLink></FaLink>
                    {userInfo.permission &&
                      userInfo.permission.includes(
                        'chapter.deleteSelf'
                      ) && (
                        <FaTrash
                          data-bs-toggle="modal"
                          data-bs-target="#deleteModal"
                          onClick={() =>
                            setDeletedId(chapter.id)
                          }
                        ></FaTrash>
                      )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="modal fade" id="deleteModal">
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
    </div>
  );
}

export default EditChapter;
