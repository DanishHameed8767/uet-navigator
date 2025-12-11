import styles from "./ProfileDialog.module.css";
import cStyles from "../Dialog.module.css";
import Input from "../../../components/Input/Input.jsx";
import Button from "../../../components/Button/Button.jsx";

const ProfileDialog = ({ closeDialog, loggedUser }) => {
    let name, email, pass;
    if (loggedUser) {
        name = loggedUser.name;
        email = loggedUser.email;
        pass = loggedUser.password;
    }

    return (
        <div className={cStyles.background} onClick={closeDialog}>
            <div
                className={cStyles.dialog + " " + styles.dialog}
                onClick={(e) => e.stopPropagation()}
            >
                <h2>Your Profile</h2>
                <p></p>
                <form className={cStyles.form} action="">
                    <Input
                        type="text"
                        label="Name"
                        autoComplete="name"
                        value={name}
                        disabled
                    />
                    <Input
                        type="text"
                        label="Email"
                        autoComplete="email"
                        value={email}
                        disabled
                    />
                    <Input type="text" label="Password" value={pass} disabled />
                    <Button
                        id="btn-save"
                        label="Go Back"
                        onClick={closeDialog}
                    />
                </form>
            </div>
        </div>
    );
};

export default ProfileDialog;
