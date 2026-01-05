import styles from "./RecentCard.module.css";
import SearchCard from "../SearchCard/SearchCard";
import { timeAgo } from "../../utils/appHelper";

const RecentCard = ({ bundle }) => {
    const stops = bundle?.stops || [];
    if (stops.length < 2 || !bundle.routeResult) {
        return null;
    }

    const timestamp = bundle?.timestamp;
    const travelMode = bundle?.travelMode;
    const time = bundle?.routeResult[bundle.selectedRoute]?.time;
    const dist = Math.round(bundle?.routeResult[bundle.selectedRoute]?.dist);

    return (
        <div className={styles["recent-card"]}>
            <>
                <div className={styles.header}>
                    <div className={styles["header-left"]}>
                        <p>{`Traveled ${travelMode === "walk" ? "on foot" : `by ${travelMode}`}`}</p>
                        <p>{` ${timeAgo(timestamp)}`}</p>
                    </div>
                    <div className={styles["header-right"]}>
                        <p>{`${dist} m`}</p>
                        <p>{`${time} min`}</p>
                    </div>
                </div>
                <div className={styles["card-wrapper"]}>
                    <span className={styles.line}></span>
                    {stops.map((stop) => {
                        const n = stop?.snap?.node;
                        return n ? (
                            <SearchCard
                                name={n.name}
                                near={n.near}
                                type={n.type}
                            />
                        ) : (
                            <></>
                        );
                    })}
                </div>
            </>
        </div>
    );
};

export default RecentCard;
