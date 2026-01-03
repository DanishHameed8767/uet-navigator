import styles from "./SearchBar.module.css";

// SearchBar.jsx
const SearchBar = ({ searchKey, setKey, inputRef, onFocus, onChange, isActive }) => {
    return (
        <div className={styles["search-bar"]}>
            <input
                className={styles.input}
                ref={inputRef}
                data-active={isActive} 
                placeholder="Search UET Map"
                value={searchKey}
                autoComplete="off"
                onChange={(e) => {
                    setKey(e.target.value); // Update the text
                    onChange();             // Trigger the mode switch logic in Home
                }}
                onFocus={onFocus}
            />
            <i className={styles.icon + " fa-solid fa-magnifying-glass"}></i>
        </div>
    );
};

export default SearchBar;