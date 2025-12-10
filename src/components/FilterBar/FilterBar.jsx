import styles from "./FilterBar.module.css";
import Button from "../Button/Button.jsx";

const FilterBar = () => {
    return (
        <div className={styles["filterbar"]}>
            <Button
                id="btn-cafe"
                label="Cafe"
                icon="fa-solid fa-utensils"
                iconPos="before"
            />
            <Button
                id="btn-hostel"
                label="Hostel"
                icon="fa-solid fa-bed"
                iconPos="before"
            />
            <Button
                id="btn-department"
                label="Departments"
                icon="fa-solid fa-building"
                iconPos="before"
            />
            <Button
                id="btn-grounds"
                label="Playgrounds"
                icon="fa-solid fa-table-tennis-paddle-ball"
                iconPos="before"
            />
            <Button
                id="btn-worship"
                label="Worship Places"
                icon="fa-solid fa-mosque"
                iconPos="before"
            />
        </div>
    );
};

export default FilterBar;
