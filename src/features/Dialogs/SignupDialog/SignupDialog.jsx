import styles from "./SignupDialog.module.css";
import cStyles from "../Dialog.module.css";
import Input from "../../../components/Input/Input.jsx";
import Button from "../../../components/Button/Button.jsx";
import { useState } from "react";

const SignupDialog = ({ closeDialog, onSubmit, switchToLogin }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onSubmit({ name, email, password });
    };

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
                <form className={cStyles.form} onSubmit={handleSubmit}>
                    <Input
                        type="text"
                        label="Name"
                        autoComplete="name"
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
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
                    <Button
                        id="btn-signup"
                        type="submit"
                        label="Create Account"
                    />
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
