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
      className="container mt-5"
      style={{ background: '#ecf0f1', borderRadius: '5px' }}
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
