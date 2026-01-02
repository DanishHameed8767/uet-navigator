import styles from "./SearchList.module.css";
import SearchCard from "../SearchCard/SearchCard";
import RecentCard from "../RecentCard/RecentCard";

const SearchList = ({ result, mode, searchKey,onSeeMore }) => {
    const dataArray = result?.toArray() || [];
    if (result === null || result?.toArray()?.length === 0) {
        return (
            <div className={styles["search-list"]}>
                <i className={styles.icon + getIcon(mode)}></i>
                <p className={styles.message}>{getMessage(mode, searchKey)}</p>
            </div>
        );
    }

    return (
        <div className={styles["search-list"]}
            onClick={(e) => e.stopPropagation()}
        >
            {mode !== "recents" &&
                dataArray.map((elem, index) => {
                    const data = elem.node ? elem.node : elem;
                    return (
                        <SearchCard
                            key={index}
                            name={data?.name}
                            near={data?.near}
                            type={data?.type}
                        />
                    );
                })}

           
            {mode === "recents" &&
    result?.toArray()?.map((elem, idx) => {
        // Access the data from the linked list node
        const data = elem.node ? elem.node : elem; 
        return (
            <RecentCard
                key={data.timestamp || idx}
                sName={data.startNode?.name}   // Maps formatted name/coords
                sNear={data.startNode?.near}   // Maps type/description
                sType={data.startNode?.type}
                eName={data.endNode?.name}     // Maps formatted name/coords
                eNear={data.endNode?.near}     // Maps type/description
                eType={data.endNode?.type}
            />
        );
    })
}
    {(mode === "saved" || mode === "recents") && result?.hasMore && (
        <button 
            className={styles["see-more-btn"]} 
            onClick={onSeeMore}
        >
            See More
        </button>
    )}


        </div>
    );
};

function getMessage(mode, key) {
    if (mode === "saved") return "No locations saved yet";
    if (mode === "recents") return "No recent travels";
    if (mode === "default") {
        
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
