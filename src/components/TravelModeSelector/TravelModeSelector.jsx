import styles from "./TravelModeSelector.module.css";

const MODES = [
    { id: "car", icon: "fa-car", label: "Car" },
    // { id: "bus", icon: "fa-bus", label: "Transit" },
    { id: "walk", icon: "fa-person-walking", label: "Walk" },
    { id: "bike", icon: "fa-bicycle", label: "Bike" },
];

export default function TravelModeSelector({ value, onChange }) {
    return (
        <div className={styles.container}>
            {MODES.map((mode) => {
                const active = value === mode.id;

                return (
                    <button
                        key={mode.id}
                        className={`${styles.button} ${active ? styles.active : ""}`}
                        onClick={() => onChange(mode.id)}
                        aria-label={mode.label}
                    >
                        <i className={`fa-solid ${mode.icon}`} />
                    </button>
                );
            })}
        </div>
    );
}
