import EditChapterImage from '../../components/manage-Manga/edit-Chapter-Image';
import EditChapterText from '../../components/manage-Manga/edit-Chapter-Text';
import WEB_CONSTANTS from '../../utilities/constants';
export async function getServerSideProps(context) {
  const server = WEB_CONSTANTS.SERVER;
  const { params } = context;
  const { id } = params;
  const response = await fetch(`${server}/chapter/${id}`);
  const data = await response.json();

  return {
    props: {
      chapter: data,
      id,
    },
  };
}

export default function EditChapterDetails({
  chapter,
  id,
}) {
  return (
    <div
      className="offset-md-2 col-lg-8 col-12 mt-5 p-3"
      style={{
        background: '#f3f3f3',
        borderRadius: '0.75rem',
        boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px',
      }}
    >
      {chapter.type === 'images' ? (
        <EditChapterImage
          chapter={chapter}
          id={id}
        ></EditChapterImage>
      ) : (
        <EditChapterText
          chapter={chapter}
          id={id}
        ></EditChapterText>
      )}
    </div>
  );
}
