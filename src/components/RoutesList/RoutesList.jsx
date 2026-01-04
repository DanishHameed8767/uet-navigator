import styles from "./RoutesList.module.css";

const RoutesList = ({ routeResult, selectedRoute, setSelectedRoute }) => {
    if (!routeResult) {
        return;
    }

    return (
        <div className={styles.list}>
            {Object.keys(routeResult).map((key) => {
                const route = routeResult[key];
                if (!route) {
                    return;
                }

                const active = key === selectedRoute;

                console.log(key, active, route);

                return (
                    <button
                        key={key}
                        className={`${styles.item} ${active ? styles.active : ""}`}
                        onClick={() => setSelectedRoute(key)}
                    >
                        <div className={styles.left}>
                            <div className={styles.title}>{key}</div>
                            <div className={styles.subtitle}>
                                Click to select.
                            </div>
                        </div>

                        <div className={styles.right}>
                            <div className={styles.time}>
                                ~ {Math.round(route.time)} min
                            </div>
                            <div className={styles.distance}>
                                {Math.round(route.dist)} m
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
};

export default RoutesList;
