import Image from 'next/image';
import styles from './display-Img.module.css';
export default function DisplayImg({
  srcImg,
  text,
  title,
  bgColor,
}) {
  return (
    <div>
      <div
        className={` ${styles.container} mb-2`}
        style={{
          aspectRatio: '3/4',
          borderRadius: '0.75rem',
          overflow: 'hidden',
        }}
      >
        <Image
          src={srcImg}
          layout="fill"
          objectFit="cover"
          alt="book Image"
        />
        <div
          className={styles.textBlock}
          style={{ backgroundColor: bgColor }}
        >
          {text}
        </div>
      </div>
      <h6 className="text-center">{title}</h6>
    </div>
  );
}
