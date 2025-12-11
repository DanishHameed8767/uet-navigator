import styles from "./SearchList.module.css";
import SearchCard from "../searchCard/searchCard";
import RecentCard from "../RecentCard/RecentCard";

const SearchList = ({ result }) => {
    return (
        <div className={styles["search-list"]}>
            {result.toArray().map((elem) => {
                return (
                    <SearchCard
                        key={elem.key}
                        name={elem.node.name}
                        near={elem.node.near}
                        type={elem.node.type}
                    />
                );
            })}
            {/* <RecentCard
                sName="Student Service Cafe"
                sNear="UET Jamia Masjid"
                sType="cafe"
                eName="Main Roundabout"
                eNear="UET National Library"
                eType="road"
            />
            <SearchCard
                name="Library"
                near="Lecture Theatre"
                type="department"
            />
            <SearchCard
                name="Student Service Cafe"
                near="UET Jamia Masjid"
                type="cafe"
            />
            <SearchCard
                name="Main Roundabout"
                near="UET National Library"
                type="road"
            />
            <SearchCard
                name="Library"
                near="Lecture Theatre"
                type="department"
            />
            <SearchCard
                name="Student Service Cafe"
                near="UET Jamia Masjid"
                type="cafe"
            />
            <SearchCard
                name="Main Roundabout"
                near="UET National Library"
                type="road"
            />
            <SearchCard
                name="Library"
                near="Lecture Theatre"
                type="department"
            />
            <SearchCard
                name="Student Service Cafe"
                near="UET Jamia Masjid"
                type="cafe"
            />
            <SearchCard
                name="Main Roundabout"
                near="UET National Library"
                type="road"
            /> */}
        </div>
    );
};

export default SearchList;
