import styles from './ImgOverlay.module.css';

export default function ImgOverlay({
  srcImg,
  title,
  description,
  view,
}) {
  return (
    <div className={styles.container}>
      <img src={srcImg} alt="" className={styles.image} />
      <div className={styles.textBlock}>{view}</div>
      <div className={styles.overlay}>
        <div className={styles.text}>
          <h5>{title}</h5>
          <p>{description}</p>
        </div>
      </div>
      <div className={styles.titleBlock}>
        <h5>{title}</h5>
      </div>
      <p className={styles.onSmallDevices}>{description}</p>
    </div>
  );
}
