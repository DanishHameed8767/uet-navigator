import Button from "../Button/Button";
import styles from "./PointInfoCard.module.css";

const PointInfoCard = ({
    name,
    near,
    lat,
    lon,
    imageUrl,
    onAddStop,
    onClose,
}) => {
    if (!open) {
        return null;
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.card}>
                {imageUrl && (
                    <div className={styles.imageWrapper}>
                        <img src={imageUrl} className={styles.image} />
                    </div>
                )}
                <div className={styles.content}>
                    <div className={styles.name}>{name}</div>
                    {near && (
                        <div className={styles.near}>{"near " + near}</div>
                    )}

                    {lat && lon && (
                        <div className={styles.coords}>
                            <p>{"Lat: " + lat.toFixed(6)}</p>
                            <p>{"Lon: " + lon.toFixed(6)}</p>
                        </div>
                    )}

                    <Button
                        icon={"fa-solid fa-plus"}
                        label={"Add Stop"}
                        onClick={onAddStop}
                    ></Button>
                    <Button
                        icon={"fa-solid fa-xmark"}
                        onClick={onClose}
                    ></Button>
                </div>
            </div>
        </div>
    );
};

export default PointInfoCard;
