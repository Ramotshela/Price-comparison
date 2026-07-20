import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";

function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [profileMsg, setProfileMsg] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();
    setProfileMsg("");
    setProfileError("");
    setProfileSubmitting(true);
    try {
      await updateProfile({ name, email });
      setProfileMsg("Profile updated successfully");
    } catch (err: any) {
      setProfileError(err.response?.data?.message || "Update failed");
    } finally {
      setProfileSubmitting(false);
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setPasswordMsg("");
    setPasswordError("");
    setPasswordSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordMsg("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || "Password change failed");
    } finally {
      setPasswordSubmitting(false);
    }
  }

  return (
    <main className="auth-page profile-page">
      <div className="profile-sections">
        <form className="auth-card" onSubmit={handleProfileSubmit}>
          <h2 className="auth-card__title">Profile</h2>
          {profileMsg && <p className="auth-card__success">{profileMsg}</p>}
          {profileError && <p className="auth-card__error">{profileError}</p>}
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
          <button type="submit" className="btn btn--primary auth-card__btn" disabled={profileSubmitting}>
            {profileSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </form>

        <form className="auth-card" onSubmit={handlePasswordSubmit}>
          <h2 className="auth-card__title">Change Password</h2>
          {passwordMsg && <p className="auth-card__success">{passwordMsg}</p>}
          {passwordError && <p className="auth-card__error">{passwordError}</p>}
          <label className="auth-card__label">
            Current Password
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="auth-card__input"
            />
          </label>
          <label className="auth-card__label">
            New Password
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="auth-card__input"
            />
          </label>
          <button type="submit" className="btn btn--primary auth-card__btn" disabled={passwordSubmitting}>
            {passwordSubmitting ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default ProfilePage;
