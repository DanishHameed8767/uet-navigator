import styles from "./SearchBar.module.css";

const SearchBar = () => {
  const placeholder = "Search UET Map";

  return (
    <div className={styles["search-bar"]}>
      <input
        className={styles.input}
        id="search-input"
        name="search-input"
        placeholder={placeholder}
      />
      <i className={styles.icon + " fa-solid fa-magnifying-glass"}></i>
    </div>
  );
};

export default SearchBar;
