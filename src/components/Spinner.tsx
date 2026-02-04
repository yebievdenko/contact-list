import "./Spinner.css";

export default function Spinner() {
  return (
    <div className="spinner" role="status" aria-live="polite">
      <span className="spinner-icon" />
      Loading...
    </div>
  );
}
