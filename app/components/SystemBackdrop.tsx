import styles from "./SystemBackdrop.module.css";

export function SystemBackdrop({ animated }: { animated: boolean }) {
  return (
    <div className={`${styles.layer} ${animated ? styles.animated : ""}`} aria-hidden="true">
      <div className={styles.megaIndex}>07</div>
      <div className={styles.verticalCode}>
        <b>SECTOR / MEMORY</b>
        <span>SUBSYSTEM 04 // FRAME 8192</span>
      </div>
      <div className={styles.sector}>
        <span />
        <div><strong>ZONE 07</strong><br />COGNITIVE TRANSFER FIELD</div>
        <b>91%</b>
      </div>
      <div className={`${styles.rail} ${styles.railA}`} />
      <div className={`${styles.rail} ${styles.railB}`} />
      <div className={styles.modules}>
        {Array.from({ length: 9 }, (_, index) => <i key={index} />)}
      </div>
      <div className={styles.warning}>
        <b>!</b>
        <span>UNSTABLE UNIVERSE BOUNDARY</span>
        <span>DATA INTEGRITY / CONDITIONAL</span>
      </div>
      <div className={styles.coordinates}>
        <span>X.019 / Y.443</span>
        <span>MEM 0x07F3A</span>
        <span>VECTOR +114.02</span>
      </div>
    </div>
  );
}
