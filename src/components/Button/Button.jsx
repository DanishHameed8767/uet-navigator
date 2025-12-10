import styles from "./Button.module.css";

const Button = ({
    id = null,
    label = "Click Here",
    icon = null,
    iconPos = "before",
    onClick,
    ...props
}) => {
    const classes = [
        styles.btn,
        icon && styles[`icon-${iconPos}`],
    ].join(" ");
    const iconElem = icon ? (
        <i className={styles.icon + " " + icon}></i>
    ) : (
        <></>
    );
    return (
        <>
            <button id={id} className={classes} onClick={onClick} {...props}>
                {iconElem}
                {label}
            </button>
        </>
    );
};

export default Button;
