import styles from "./Navbar.module.css";
import Button from "../../components/Button/Button.jsx";

const Navbar = ({
    loggedUser,
    logoutUser,
    openLogin,
    openProfile,
    toggleTheme,
}) => {
    const name = loggedUser != null ? "Profile" : "Guest";

    return (
        <div className={styles.navbar}>
            <div className={styles["top-section"]}>
                <Button
                    id="profile-btn"
                    label={name}
                    icon="fa-solid fa-user"
                    iconPos="above"
                    onClick={() => {
                        if (loggedUser) openProfile();
                        else openLogin();
                    }}
                />
                <Button
                    id="saved-btn"
                    label="Saved"
                    icon="fa-regular fa-bookmark"
                    iconPos="above"
                    onClick={() => {
                        if (loggedUser) console.log("saved");
                        else openLogin();
                    }}
                />
                <Button
                    id="recent-btn"
                    label="Recents"
                    icon="fa-solid fa-clock-rotate-left"
                    iconPos="above"
                    onClick={() => {
                        if (loggedUser) console.log("recent");
                        else openLogin();
                    }}
                />
            </div>
            <div className={styles["bottom-section"]}>
                <Button
                    id="theme-btn"
                    label="Toggle Theme"
                    icon="fa-solid fa-circle-half-stroke"
                    iconPos="above"
                    onClick={toggleTheme}
                />
                <Button
                    id="logout-btn"
                    label="Logout"
                    icon="fa-solid fa-door-open"
                    iconPos="above"
                    onClick={logoutUser}
                />
            </div>
        </div>
    );
};
export default Navbar;
