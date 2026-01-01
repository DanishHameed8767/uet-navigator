import styles from "./Input.module.css";

const Input = ({ label = "", name, ...props }) => {
    const input = (
        <input className={styles.input} id={name} name={name} {...props} />
    );

    return (
        <div className={`${styles.group} ${!label ? styles.noLabel : ""}`}>
            {input}
            {label && (
                <label className={styles.label} htmlFor={name}>
                    {label}
                </label>
            )}
        </div>
    );
};
export default Input;
