import styles from "./PickPathCard.module.css";
import Button from "../Button/Button.jsx";
import SearchCard from "../SearchCard/SearchCard.jsx";

const PickPathDialog = ({
    stops,
    setStops,
    handlePathVisit,
    handleStopSave,
}) => {
    const deleteStop = (e, idx) => {
        if (e.button !== 0) {
            e.preventDefault();
            setStops((prev) => prev.filter((_, i) => i !== idx));
        }
    };

    return (
        <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            <h2>Selected Places</h2>
            {stops.map((stop, idx) => {
                return (
                    <SearchCard
                        key={idx}
                        name={
                            stop
                                ? `${stop.point.x}-${stop.point.y}`
                                : "Please select on map"
                        }
                        type={stop?.type}
                        near={stop?.near}
                        onContextMenu={(e) => deleteStop(e, idx)}
                        onDoubleClick={() => handleStopSave(stop)}
                    />
                );
            })}
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

export default PickPathDialog;
