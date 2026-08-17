import styles from "./GlitchField.module.css";

export function GlitchField({ strong = false }: { strong?: boolean }) {
  return (
    <div className={`${styles.field} ${strong ? styles.strong : ""}`} aria-hidden="true">
      <i className={`${styles.band} ${styles.bandA}`} />
      <i className={`${styles.band} ${styles.bandB}`} />
      <i className={`${styles.band} ${styles.bandC}`} />
      <i className={`${styles.block} ${styles.blockA}`} />
      <i className={`${styles.block} ${styles.blockB}`} />
      <i className={`${styles.block} ${styles.blockC}`} />
    </div>
  );
}
