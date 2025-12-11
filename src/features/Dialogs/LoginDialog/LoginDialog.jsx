import styles from "./LoginDialog.module.css";
import cStyles from "../Dialog.module.css";
import Input from "../../../components/Input/Input.jsx";
import Button from "../../../components/Button/Button.jsx";
import { useState } from "react";

const LoginDialog = ({ closeDialog, onSubmit, switchToSignup }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onSubmit({ email, password });
    };

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
                <form className={cStyles.form} onSubmit={handleSubmit}>
                    <Input
                        type="text"
                        label="Email"
                        autoComplete="email"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Input
                        type="Password"
                        label="Password"
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <Button id="btn-login" label="Login" type="submit" />
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
