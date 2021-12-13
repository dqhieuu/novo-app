import { useContext } from 'react';
import { MangaContext } from '../../Context/MangaContext';

import NULL_CONSTANTS from '../../utilities/nullConstants';
import Link from 'next/link';
import {
  FaEye,
  FaNewspaper,
  FaUser,
  FaWifi,
} from 'react-icons/fa';
import styles from './byWeek.module.css';
export default function ByWeek() {
  const { mostViewedWeek, server } =
    useContext(MangaContext);
  return (
    <div>
      {mostViewedWeek.slice(0, 5).map((manga, index) => (
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
          <Link href={`/mangas/${manga.id}`} passHref>
            <div className="col-3">
              <img
                src={
                  manga.image
                    ? `${server}/image/${manga.image}`
                    : NULL_CONSTANTS.BOOK_GROUP_IMAGE
                }
                alt={manga.name}
                style={{
                  width: '100%',
                  aspectRatio: '4/3',
                  objectFit: 'cover',
                }}
              />
            </div>
          </Link>
          <Link href={`/mangas/${manga.id}`} passHref>
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
