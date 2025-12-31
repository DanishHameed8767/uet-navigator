import styles from "./BottomPopup.module.css";

export default function BottomPopup({
    open,
    title = "Routes",
    onClose,
    children,
}) {
    if (!open) {
        return null;
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.title}>{title}</div>

                    <button
                        className={styles.closeBtn}
                        onClick={onClose}
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                <div className={styles.content}>{children}</div>
            </div>
        </div>
    );
}
