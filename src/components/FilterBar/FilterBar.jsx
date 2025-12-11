import styles from "./FilterBar.module.css";
import Button from "../Button/Button.jsx";

const FilterBar = () => {
    return (
        <div className={styles["filterbar"]}>
            <Button
                id="btn-cafe"
                label="Cafes"
                icon="fa-solid fa-utensils"
                iconPos="before"
            />
            <Button
                id="btn-hostel"
                label="Hostels"
                icon="fa-solid fa-bed"
                iconPos="before"
            />
            <Button
                id="btn-department"
                label="Departments"
                icon="fa-solid fa-graduation-cap"
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

// Roads Icon: <i class="fa-solid fa-road"></i>
// Paths Icon: <i class="fa-solid fa-lines-leaning"></i>

export default FilterBar;
