import { getIconByType } from "../../utils/appHelper.js";
import styles from "./SearchCard.module.css";

const SearchCard = ({
    name,
    near,
    type,
    onClick,
    onContextMenu,
    onDoubleClick,
}) => {
    return (
        <div
            className={styles["search-card"]}
            onClick={onClick}
            onContextMenu={onContextMenu}
            onDoubleClick={onDoubleClick}
        >
            <div className={styles["icon-wrapper"]}>
                <i className={styles.icon + " " + getIconByType(type)}></i>
            </div>
            <div className={styles["label-wrapper"]}>
                <h3>{name || "unnamed point"}</h3>
                <p>{"Near " + (near || "not found")}</p>
            </div>
        </div>
    );
};

export default SearchCard;
