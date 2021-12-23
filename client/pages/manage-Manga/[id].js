import EditChapter from '../../components/manage-Manga/edit-Chapter';
import EditDetail from '../../components/manage-Manga/edit-Detail';
import WEB_CONSTANTS from '../../utilities/constants';
export async function getServerSideProps(context) {
  const server = WEB_CONSTANTS.SERVER;
  const { params } = context;
  const { id } = params;
  const response = await fetch(`${server}/book/${id}`);
  const data = await response.json();

  return {
    props: {
      manga: data,
      id,
    },
  };
}

export default function EditManga({ manga, id }) {
  return (
    <div
      className="container mt-3"
      style={{ background: '#ecf0f1', borderRadius: '5px' }}
    >
      <ul
        className="nav nav-tabs nav-justified"
        id="myTab"
        role="tablist"
      >
        <li className="nav-item" role="presentation">
          <button
            className="nav-link active"
            id="week-tab"
            data-bs-toggle="tab"
            data-bs-target="#week"
            type="button"
            role="tab"
            aria-controls="week"
            aria-selected="true"
          >
            THÔNG TIN TRUYỆN
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className="nav-link"
            id="month-tab"
            data-bs-toggle="tab"
            data-bs-target="#month"
            type="button"
            role="tab"
            aria-controls="month"
            aria-selected="false"
          >
            QUẢN LÝ CHAPTER
          </button>
        </li>
      </ul>

      <div className="tab-content ">
        <div
          className="tab-pane active"
          id="week"
          role="tabpanel"
          aria-labelledby="week-tab"
        >
          <EditDetail
            manga={manga}
            bookGroupId={id}
          ></EditDetail>
        </div>
        <div
          className="tab-pane "
          id="month"
          role="tabpanel"
          aria-labelledby="month-tab"
        >
          <EditChapter
            manga={manga}
            bookGroupId={id}
          ></EditChapter>
        </div>
      </div>
    </div>
  );
}
