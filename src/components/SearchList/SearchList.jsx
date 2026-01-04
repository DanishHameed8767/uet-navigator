import styles from "./SearchList.module.css";
import SearchCard from "../SearchCard/SearchCard";
import RecentCard from "../RecentCard/RecentCard";
import { resolveNameType, resolveNear } from "../../utils/mapHelper";

const SearchList = ({
    result,
    mode,
    key,
    onSeeMore,
    addStop,
    nodes,
    adjacency,
    nodeLookup,
}) => {
    let dataArray = result?.toArray() || [];

    const fallBackElem = (
        <div className={styles["search-list"]}>
            <i className={styles.icon + getIcon(mode)}></i>
            <p className={styles.message}>{getMessage(mode, key)}</p>
        </div>
    );
    if (result === null || result?.toArray()?.length === 0) {
        return { fallBackElem };
    }

    if (mode === "saved") {
        dataArray = dataArray.map((stop) => {
            const { name } =
                resolveNameType(stop, adjacency, nodeLookup) || "unnamed";
            const near = resolveNear(stop.type, name, nodes) || "not found";
            return {
                ...stop?.snap?.node,
                name,
                near,
            };
        });
    } else {
        return { fallBackElem };
    }

    return (
        <div
            className={styles["search-list"]}
            onClick={(e) => e.stopPropagation()}
        >
            {mode === "saved" &&
                dataArray.map((node, index) => (
                    <SearchCard
                        key={index}
                        name={node?.name}
                        near={node?.near}
                        type={node?.type}
                    />
                ))}

            {/* 

            {mode === "recents" &&
                result?.toArray()?.map((elem, idx) => {
                    // Access the data from the linked list node
                    const data = elem.node ? elem.node : elem;
                    return (
                        <RecentCard
                            key={data.timestamp || idx}
                            sName={data.startNode?.name} // Maps formatted name/coords
                            sNear={data.startNode?.near} // Maps type/description
                            sType={data.startNode?.type}
                            eName={data.endNode?.name} // Maps formatted name/coords
                            eNear={data.endNode?.near} // Maps type/description
                            eType={data.endNode?.type}
                        />
                    );
                })}
            {(mode === "saved" || mode === "recents") && result?.hasMore && (
                <button className={styles["see-more-btn"]} onClick={onSeeMore}>
                    See More
                </button>
            )} */}
        </div>
    );
};

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
