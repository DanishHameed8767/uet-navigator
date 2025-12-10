import styles from "./LoginDialog.module.css";
import cStyles from "../Dialog.module.css";
import Input from "../../../components/Input/Input.jsx";
import Button from "../../../components/Button/Button.jsx";

const LoginDialog = ({ closeDialog, switchToSignup }) => {
    return (
        <div className={cStyles.background} onClick={closeDialog}>
            <div
                className={cStyles.dialog + " " + styles.dialog}
                onClick={(e) => e.stopPropagation()}
            >
                <h2>Welcome Back!</h2>
                <p>
                    Please login to your profile to access additional features.
                </p>
                <form className={cStyles.form} action="">
                    <Input type="text" label="Email" autoComplete="email" />
                    <Input type="Password" label="Password" />
                    <Button id="btn-login" label="Login" />
                </form>
                <div>
                    <p>Have no account?&nbsp;</p>
                    <a href="#" onClick={switchToSignup}>
                        Create account
                    </a>
                </div>
            </div>
        </div>
    );
};

export default LoginDialog;
