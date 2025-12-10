import styles from "./SignupDialog.module.css";
import cStyles from "../Dialog.module.css";
import Input from "../../../components/Input/Input.jsx";
import Button from "../../../components/Button/Button.jsx";

const SignupDialog = ({ closeDialog, switchToLogin }) => {
    return (
        <div className={cStyles.background} onClick={closeDialog}>
            <div
                className={cStyles.dialog + " " + styles.dialog}
                onClick={(e) => e.stopPropagation()}
            >
                <h2>Get Started!</h2>
                <p>
                    Create your profile now and unlock full potential of this
                    map.
                </p>
                <form className={cStyles.form} action="">
                    <Input type="text" label="Name" autoComplete="name" />
                    <Input type="text" label="Email" autoComplete="email" />
                    <Input type="Password" label="Password" />
                    <Button id="btn-signup" label="Create Account" />
                </form>
                <div>
                    <p>Already have an account?&nbsp;</p>
                    <a href="#" onClick={switchToLogin}>
                        Login
                    </a>
                </div>
            </div>
        </div>
    );
};

export default SignupDialog;
