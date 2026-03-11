import styles from "./EditAdornment.module.scss";

export function EditAdornment() {
  return (
    <span className={styles["icon-button"]} aria-hidden="true">
      <svg
        className={styles["icon"]}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 20L8.5 18.8L18.4 8.9C19.2 8.1 19.2 6.9 18.4 6.1L17.9 5.6C17.1 4.8 15.9 4.8 15.1 5.6L5.2 15.5L4 20Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13.5 7.2L16.8 10.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}