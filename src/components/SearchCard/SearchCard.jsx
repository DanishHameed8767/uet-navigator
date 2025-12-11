import styles from "./SearchCard.module.css";

const SearchCard = ({ name, near, type }) => {
    return (
        <div className={styles["search-card"]}>
            <div className={styles["icon-wrapper"]}>
                <i className={styles.icon + " " + getIconByType(type)}></i>
            </div>
            <div className={styles["label-wrapper"]}>
                <h3>{name}</h3>
                <p>{"Near " + near}</p>
            </div>
        </div>
    );
};

function getIconByType(type) {
    if (type === "road") return "fa-solid fa-road";
    if (type === "street") return "fa-solid fa-lines-leaning";
    if (type === "path") return "fa-solid fa-lines-leaning";
    if (type === "department") return "fa-solid fa-graduation-cap";
    if (type === "hostel") return "fa-solid fa-bed";
    if (type === "cafe") return "fa-solid fa-utensils";
    if (type === "grounds") return "fa-solid fa-table-tennis-paddle-ball";
    if (type === "worship") return "fa-solid fa-mosque";
    return "";
}

export default SearchCard;
