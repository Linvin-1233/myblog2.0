import type { CSSProperties } from "react";
import styles from "./DataWarp.module.css";

const packets = Array.from({ length: 22 }, (_, index) => {
  const angle = ((index * 137.5 + 18) * Math.PI) / 180;
  const distance = 360 + (index % 7) * 72;
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance * 0.72,
    size: 3 + (index % 5) * 2,
    scale: 1.4 + (index % 6) * 0.5,
    delay: -(index % 17) * 0.23,
    duration: 3.3 + (index % 5) * 0.38,
    rotation: `${(index % 2 ? -1 : 1) * (20 + index * 7)}deg`,
    fill: `${8 + (index % 4) * 9}%`,
  };
});

export function DataWarp() {
  return (
    <div className={styles.field} aria-hidden="true">
      {packets.map((packet, index) => (
        <i
          key={index}
          className={styles.packet}
          style={{
            "--x": `${packet.x}px`,
            "--y": `${packet.y}px`,
            "--size": `${packet.size}px`,
            "--scale": packet.scale,
            "--delay": `${packet.delay}s`,
            "--duration": `${packet.duration}s`,
            "--rotation": packet.rotation,
            "--fill": packet.fill,
          } as CSSProperties}
        />
      ))}
      <div className={styles.crashLayer}>
        <i className={styles.sliceA} />
        <i className={styles.sliceB} />
        <i className={styles.sliceC} />
        <div className={styles.fault}>
          <b>KERNEL_SIGNAL_LOST</b>
          <span>MEM://0x0007F3A</span>
          <span>FRAME COLLAPSE / RECOVERING</span>
        </div>
      </div>
    </div>
  );
}
