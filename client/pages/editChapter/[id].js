import EditChapterImage from '../../components/manageManga/editChapterImage';
import EditChapterText from '../../components/manageManga/editChapterText';
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
    },
  };
}

export default function EditChapterDetails({ chapter }) {
  return (
    <div
      className="container mt-5"
      style={{ background: '#ecf0f1', borderRadius: '5px' }}
    >
      {chapter.type === 'images' ? (
        <EditChapterImage
          chapter={chapter}
        ></EditChapterImage>
      ) : (
        <EditChapterText
          chapter={chapter}
        ></EditChapterText>
      )}
    </div>
  );
}
