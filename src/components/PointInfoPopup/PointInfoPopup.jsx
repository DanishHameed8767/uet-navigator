import styles from "./PointInfoPopup.module.css";

export default function PointInfoPopup({
    open,
    name,
    near,
    lat,
    lng,
    imageUrl,
    onAddStop,
    onClose,
    position,
}) {
    if (!open || !position) {
        return null;
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.card}>
                {/* Image */}
                <div className={styles.imageWrapper}>
                    <img src={imageUrl} alt={name} className={styles.image} />
                </div>

                {/* Content */}
                <div className={styles.content}>
                    <div className={styles.header}>
                        <div className={styles.name}>{name}</div>

                        <button className={styles.closeBtn} onClick={onClose}>
                            ✕
                        </button>
                    </div>

                    <div className={styles.near}>Near {near}</div>

                    <div className={styles.coords}>
                        {lat.toFixed(6)}, {lng.toFixed(6)}
                    </div>

                    <button className={styles.addStopBtn} onClick={onAddStop}>
                        + Add Stop
                    </button>
                </div>
            </div>
        </div>
    );
}
