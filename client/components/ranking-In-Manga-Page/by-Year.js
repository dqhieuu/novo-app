import { useContext } from 'react';
import { MangaContext } from '../../context/manga-Context';
import NULL_CONSTANTS from '../../utilities/null-Constants';
import Link from 'next/link';
import { FaEye } from 'react-icons/fa';
import styles from './by-Week.module.css';
import Image from 'next/image';
export default function ByYear() {
  const { mostViewedYear, server } =
    useContext(MangaContext);
  return (
    <div>
      {mostViewedYear.slice(0, 5).map((manga, index) => (
        <div
          className="row mt-2 border-bottom "
          key={index}
        >
          <div className="col-2 d-flex justify-content-center align-items-center">
            <h3
              style={
                index === 0
                  ? { color: '#1abc9c' }
                  : index === 1
                  ? { color: '#3498db' }
                  : index === 2
                  ? { color: '#e74c3c' }
                  : { color: 'black' }
              }
            >
              0{index + 1}
            </h3>
          </div>
          <Link href={`/manga/${manga.id}`} passHref>
            <div className="col-3">
              <Image
                src={
                  manga.image
                    ? `${server}/image/${manga.image}`
                    : NULL_CONSTANTS.BOOK_GROUP_IMAGE
                }
                alt={manga.name}
                height="80"
                width="100"
                objectFit="cover"
                layout="responsive"
              />
            </div>
          </Link>
          <Link href={`/manga/${manga.id}`} passHref>
            <div
              className="col-6"
              style={{
                whiteSpace: 'nowrap',

                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              <p className={styles.object}>{manga.title}</p>
              <div className="d-flex justify-content-between">
                <p className={styles.object}>
                  {'Chapter ' + manga.latestChapter}
                </p>
                <p>
                  <FaEye></FaEye>
                  {` ${manga.views} lượt đọc`}
                </p>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
