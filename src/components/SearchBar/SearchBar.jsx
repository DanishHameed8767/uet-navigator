import styles from "./SearchBar.module.css";

const SearchBar = ({ searchKey, setKey, ref, onFocus, onBlur, onChange }) => {
    const placeholder = "Search UET Map";

    return (
        <div className={styles["search-bar"]}>
            <input
                className={styles.input}
                ref={ref}
                id="search-input"
                name="search-input"
                placeholder={placeholder}
                value={searchKey}
                autoComplete="off"
                onChange={(e) => {
                    setKey(e.target.value);
                    onChange();
                }}
                onFocus={onFocus}
                onBlur={() => {
                    onBlur();
                    onChange();
                }}
            />
            <i className={styles.icon + " fa-solid fa-magnifying-glass"}></i>
        </div>
    );
};

export default SearchBar;
