import styles from "./displayImg.module.css";
export default function DisplayImg({ srcImg, text, title, height, bgColor }) {
  return (
    <div className={` ${styles.container} mb-5`} style={{ height: height }}>
      <img
        src={srcImg}
        className="rounded img-fluid"
        style={{
          width: "100%",
          objectFit: "cover",
          height: "inherit",
        }}
      />
      <div className={styles.textBlock} style={{ backgroundColor: bgColor }}>
        {text}
      </div>
      <h6 className="text-center">{title}</h6>
    </div>
  );
}
