import styles from "./SearchList.module.css";
import SearchCard from "../searchCard/searchCard";
import RecentCard from "../RecentCard/RecentCard";

const SearchList = ({ result, mode, searchKey }) => {
    if (result === null || result?.toArray()?.length === 0) {
        return (
            <div className={styles["search-list"]}>
                <i className={styles.icon + getIcon(mode)}></i>
                <p className={styles.message}>{getMessage(mode, searchKey)}</p>
            </div>
        );
    }

    return (
        <div className={styles["search-list"]}>
            {mode !== "recents" &&
                result?.toArray()?.map((elem) => {
                    return (
                        <SearchCard
                            key={elem?.key}
                            name={elem?.node?.name}
                            near={elem?.node?.near}
                            type={elem?.node?.type}
                        />
                    );
                })}
            {mode === "recents" &&
                result?.toArray()?.map((elem) => {
                    console.log(elem);
                    return (
                        <RecentCard
                            key={elem?.key}
                            sName={elem?.startNode?.name}
                            sNear={elem?.startNode?.near}
                            sType={elem?.startNode?.type}
                            eName={elem?.endNode?.name}
                            eNear={elem?.endNode?.near}
                            eType={elem?.endNode?.type}
                        />
                    );
                })}
        </div>
    );
};

function getMessage(mode, key) {
    if (mode === "saved") return "No locations saved yet";
    if (mode === "recents") return "No recent travels";
    if (mode === "default") {
        console.log(key);
        if (!key || key === "") {
            return "Enter some keyword to search locations";
        } else {
            return "No location matched your keyword";
        }
    }
}

function getIcon(mode) {
    if (mode === "saved") return " fa-regular fa-bookmark";
    if (mode === "recents") return " fa-solid fa-clock-rotate-left";
    if (mode === "default") return " fa-solid fa-magnifying-glass";
}

export default SearchList;
