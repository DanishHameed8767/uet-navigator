import styles from "./StopsCard.module.css";
import Button from "../Button/Button.jsx";
import SearchCard from "../SearchCard/SearchCard.jsx";
import { resolveNear, resolveNameType } from "../../utils/mapHelper.js";

const StopsCard = ({
    stops,
    setStops,
    handlePathVisit,
    handleStopSave,
    nodes,
    adjacency,
    nodeLookup,
}) => {
    const deleteStop = (e, idx) => {
        if (e.button !== 0) {
            e.preventDefault();
            setStops((prev) => prev.filter((_, i) => i !== idx));
        }
    };

    const seen = new Set();
    const stopsSet = stops.filter((stop) => {
        const key = `${stop?.snap?.node?.x}-${stop?.snap?.node?.x}`;
        return seen.has(key) ? false : seen.add(key);
    });

    return (
        <div className={styles.card} onClick={(e) => e.stopPropagation()}>
            <h2>Selected Places</h2>
            <div className={styles["cards-wrapper"]}>
                {stopsSet.map((stop, idx) => {
                    let { name, type } = resolveNameType(
                        stop,
                        adjacency,
                        nodeLookup
                    );
                    console.log(name, type);
                    name = name || "unnamed point";
                    type = type || "other";
                    let near = resolveNear(stop, name, nodes) || "not found";
                    near = near.length > 40 ? near.slice(0, 40) + "..." : near;
                    return (
                        <SearchCard
                            key={idx}
                            name={name}
                            type={type}
                            near={near}
                            onContextMenu={(e) => deleteStop(e, idx)}
                            onDoubleClick={() => handleStopSave(stop)}
                        />
                    );
                })}
            </div>
            <div className={styles["btn-wrapper"]}>
                <Button
                    id="btn-reverse"
                    icon="fa-solid fa-arrow-right-arrow-left"
                    iconPos="above"
                    onClick={() => setStops((prev) => [...prev.reverse()])}
                />
                <Button
                    id="btn-clear"
                    icon="fa-solid fa-trash"
                    iconPos="above"
                    onClick={() => setStops([])}
                />
                <Button id="btn-run" label="Visit" onClick={handlePathVisit} />
            </div>
        </div>
    );
};

export default StopsCard;
