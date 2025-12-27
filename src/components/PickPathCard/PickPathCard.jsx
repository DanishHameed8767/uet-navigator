import styles from "./PickPathCard.module.css";
import { useState } from "react";
import RecentCard from "../RecentCard/RecentCard.jsx";
import Button from "../Button/Button.jsx";

const PickPathDialog = ({ sNode, eNode }) => {
    return (
        <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            <h2>Selected Places</h2>
            <RecentCard
                sName={sNode ? sNode.name : "Please select on map"}
                sType={sNode ? sNode.type : null}
                sNear={sNode ? sNode.near : null}
                eName={eNode ? eNode.name : "Please select on map"}
                eType={eNode ? eNode.type : null}
                eNear={eNode ? eNode.near : null}
            />
            <div className={styles["btn-wrapper"]}>
                <Button id="btn-discard" label="Cancel" />
                <Button id="btn-run" label="Get Path" />
            </div>
        </div>
    );
};

export default PickPathDialog;
