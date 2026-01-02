import styles from "./SearchBar.module.css";

const SearchBar = ({ searchKey, setKey, inputRef, onFocus, onChange, isActive }) => {
    return (
        <div className={styles["search-bar"]}>
            <input
                className={styles.input}
                ref={inputRef}
                /* This attribute keeps the bar square even when focus leaves */
                data-active={isActive} 
                placeholder="Search UET Map"
                value={searchKey}
                autoComplete="off"
                onChange={(e) => {
                    setKey(e.target.value);
                    onChange();
                }}
                onFocus={onFocus}
            />
            <i className={styles.icon + " fa-solid fa-magnifying-glass"}></i>
        </div>
    );
};


export default SearchBar;
