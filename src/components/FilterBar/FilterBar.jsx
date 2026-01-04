import styles from "./FilterBar.module.css";
import Button from "../Button/Button.jsx";

const FilterBar = ({ filter, setFilter }) => {
    const handleBtnClick = (value) => {
        setFilter((prev) => (prev !== value ? value : null));
    };
    return (
        <div className={styles["filterbar"]}>
            <Button
                id={filter === "cafe" ? styles["active-filter-btn"] : null}
                label="Cafes"
                icon="fa-solid fa-utensils"
                iconPos="before"
                onClick={() => handleBtnClick("cafe")}
            />
            <Button
                id={filter === "hostel" ? styles["active-filter-btn"] : null}
                label="Hostels"
                icon="fa-solid fa-bed"
                iconPos="before"
                onClick={() => handleBtnClick("hostel")}
            />
            <Button
                id={filter === "dept" ? styles["active-filter-btn"] : null}
                label="Departments"
                icon="fa-solid fa-graduation-cap"
                iconPos="before"
                onClick={() => handleBtnClick("dept")}
            />
            <Button
                id={filter === "ground" ? styles["active-filter-btn"] : null}
                label="Playgrounds"
                icon="fa-solid fa-table-tennis-paddle-ball"
                iconPos="before"
                onClick={() => handleBtnClick("ground")}
            />
            <Button
                id={filter === "worship" ? styles["active-filter-btn"] : null}
                label="Worship Places"
                icon="fa-solid fa-mosque"
                iconPos="before"
                onClick={() => handleBtnClick("worship")}
            />
        </div>
    );
};

// Roads Icon: <i class="fa-solid fa-road"></i>
// Paths Icon: <i class="fa-solid fa-lines-leaning"></i>

export default FilterBar;
