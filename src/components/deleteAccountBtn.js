import React, { useState } from "react";
import "./deleteAccountModal.css";

function DeleteAccountModal({ onTriggerLogin }) {
  const [showModal, setShowModal] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [status, setStatus] = useState("");

  const handleDelete = async () => {
    // 👇 Close the modal immediately when button is clicked
    setShowModal(false);

    if (!confirm) {
      setStatus("Please confirm account deletion.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/api/delete_account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, confirm }),
      });

      const result = await response.json();
      setStatus(result.message);

      if (result.success) {
        localStorage.removeItem("user");
        sessionStorage.clear();
        onTriggerLogin(); // 🔁 Trigger login modal
      }
    } catch (error) {
      setStatus("Error contacting server.");
      console.error("Delete error:", error);
    }
  };

  return (
    <>
      <button className="danger" onClick={() => setShowModal(true)}>
        Delete Account
      </button>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Account Deletion</h3>
            <p>
              This action is irreversible. Please enter your credentials to
              proceed. <b>Once you log out, you can never log back in as this user
              since it will no longer exist.It will only function if teh password and username are entered properly</b>
            </p>

            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <label>
              <input
                type="checkbox"
                checked={confirm}
                onChange={(e) => setConfirm(e.target.checked)}
              />
              Confirm deletion
            </label>

            <div className="modal-actions">
              <button className="danger1" onClick={handleDelete}>
                Yes, Delete
              </button>
              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>
            <p>{status}</p>
          </div>
        </div>
      )}
    </>
  );
}

export default DeleteAccountModal;