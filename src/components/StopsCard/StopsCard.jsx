import styles from "./StopsCard.module.css";
import Button from "../Button/Button.jsx";
import SearchCard from "../SearchCard/SearchCard.jsx";

const StopsCard = ({ stops, setStops, handlePathVisit, handleStopSave }) => {
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
                    let node = stop?.snap?.node;
                    return (
                        <SearchCard
                            key={idx}
                            name={node?.name}
                            type={node?.type}
                            near={node?.near}
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
