import styles from "./RoutesList.module.css";

export default function RoutesList({ routes, selectedId, onSelect }) {
    return (
        <div className={styles.list}>
            {routes.map((route) => {
                const active = route.id === selectedId;

                return (
                    <button
                        key={route.id}
                        className={`${styles.item} ${active ? styles.active : ""}`}
                        onClick={() => onSelect(route)}
                    >
                        <div className={styles.left}>
                            <div className={styles.title}>{route.title}</div>
                            <div className={styles.subtitle}>
                                {route.subtitle}
                            </div>
                        </div>

                        <div className={styles.right}>
                            <div className={styles.time}>{route.time} min</div>
                            <div className={styles.distance}>
                                {route.distance} m
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
