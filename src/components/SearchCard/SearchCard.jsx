import { getIconByType } from "../../utils/mapHelper";
import styles from "./SearchCard.module.css";

const SearchCard = ({ name, near, type }) => {
    return (
        <div className={styles["search-card"]}>
            <div className={styles["icon-wrapper"]}>
                <i className={styles.icon + " " + getIconByType(type)}></i>
            </div>
            <div className={styles["label-wrapper"]}>
                <h3>{name}</h3>
                <p>{near ? "Near " + near : "(Nothing to display)"}</p>
            </div>
        </div>
    );
};

export default SearchCard;
