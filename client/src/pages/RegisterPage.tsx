import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(name, email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2 className="auth-card__title">Create Account</h2>
        {error && <p className="auth-card__error">{error}</p>}
        <label className="auth-card__label">
          Name
          <input
            type="text"
            required
            minLength={2}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="auth-card__input"
          />
        </label>
        <label className="auth-card__label">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-card__input"
          />
        </label>
        <label className="auth-card__label">
          Password
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-card__input"
          />
        </label>
        <button type="submit" className="btn btn--primary auth-card__btn" disabled={submitting}>
          {submitting ? "Creating account..." : "Create Account"}
        </button>
        <p className="auth-card__footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </form>
    </main>
  );
}

export default RegisterPage;
