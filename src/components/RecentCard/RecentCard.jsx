import styles from "./RecentCard.module.css";
import SearchCard from "../searchCard/searchCard";

const RecentCard = ({ sName, sNear, sType, eName, eNear, eType }) => {
    return (
        <div className={styles["recent-card"]}>
            <SearchCard name={sName} near={sNear} type={sType} />
            <SearchCard name={eName} near={eNear} type={eType} />
        </div>
    );
};

export default RecentCard;
