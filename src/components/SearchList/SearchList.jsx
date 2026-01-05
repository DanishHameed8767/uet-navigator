import styles from "./SearchList.module.css";
import SearchCard from "../SearchCard/SearchCard";
import RecentCard from "../RecentCard/RecentCard";

const SearchList = ({ result, mode, searchKey, onItemClick, onSeeMore }) => {
    const dataArray = result?.toArray ? result.toArray() : [];
    const fallBackElem = (
        <div className={styles["search-list"]}>
            <i className={styles.icon + getIcon(mode)}></i>
            <p className={styles.message}>{getMessage(mode, searchKey)}</p>
        </div>
    );
    if (!dataArray || dataArray.length === 0) {
        return fallBackElem;
    }

    return (
        <div
            className={styles["search-list"]}
            onClick={(e) => e.stopPropagation()}
        >
            {mode === "default" &&
                dataArray.map((node, index) => (
                    <SearchCard
                        key={node.id || index}
                        name={node.name}
                        near={node.near}
                        type={node.type}
                        onClick={() => onItemClick(node)}
                    />
                ))}

            {mode === "saved" &&
                dataArray.map((bundle, index) => {
                    const node = bundle.stop?.snap?.node;
                    return (
                        <SearchCard
                            key={index}
                            name={node?.name || "Unnamed Point"}
                            near={node?.near || "Saved Location"}
                            type={node?.type || "other"}
                            onClick={() => onItemClick(bundle)}
                        />
                    );
                })}

            {mode === "recents" &&
                dataArray.map((bundle, index) => (
                    <div key={index} onClick={() => onItemClick(bundle)}>
                        <RecentCard bundle={bundle} />
                    </div>
                ))}

            {result?.hasMore && (
                <button className={styles["see-more-btn"]} onClick={onSeeMore}>
                    See More
                </button>
            )}
        </div>
    );
};

// UI Helpers preserved from original file
function getMessage(mode, key) {
    if (mode === "saved") {
        return "No locations saved yet";
    }
    if (mode === "recents") {
        return "No recent travels";
    }
    if (mode === "default") {
        if (!key || key === "") {
            return "Enter some keyword to search locations";
        } else {
            return 'No location matched keyword "' + key + '"';
        }
    }
}

function getIcon(mode) {
    if (mode === "saved") {
        return " fa-regular fa-bookmark";
    }
    if (mode === "recents") {
        return " fa-solid fa-clock-rotate-left";
    }
    if (mode === "default") {
        return " fa-solid fa-magnifying-glass";
    }
}

export default SearchList;
