const WARN_AT = 60;

interface IdleWarningProps {
  secondsLeft: number;
  onStayLoggedIn: () => void;
}

function IdleWarning({ secondsLeft, onStayLoggedIn }: IdleWarningProps) {
  if (secondsLeft > WARN_AT) return null;

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const display = mins > 0 ? `${mins}:${String(secs).padStart(2, "0")}` : `${secs}s`;

  return (
    <div className="idle-warning">
      <span className="idle-warning__text">
        You'll be logged out due to inactivity in{" "}
        <strong className="idle-warning__countdown">{display}</strong>
      </span>
      <button className="btn btn--sm idle-warning__btn" onClick={onStayLoggedIn}>
        Stay logged in
      </button>
    </div>
  );
}

export default IdleWarning;
