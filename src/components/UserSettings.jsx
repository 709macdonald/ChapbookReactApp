import React, { useState, useEffect } from "react";
import jwt_decode from "jwt-decode";

export default function UserSettings({
  setShowUserSettings,
  setToggleSideBar,
  setShowAllFiles,
  toggleTheme,
  isDarkMode,
  handleClose,
  setFiles, // ✅ add this
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Fetch user data when component mounts
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          // Decode token to get user ID
          const decoded = jwt_decode(token);
          setUserId(decoded.userId);

          // Fetch user profile data
          const response = await fetch("/api/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            // Set the initial state with user data
            setFirstName(userData.firstName || "");
            setLastName(userData.lastName || "");
            setEmail(userData.email || "");
          } else {
            setError("Failed to fetch user data");
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
          setError("Error fetching user data");
        }
      }
    };

    fetchUserData();
  }, []);

  const handleCloseSettings = () => {
    if (handleClose) {
      handleClose();
    } else {
      setShowUserSettings(false);
    }
  };

  const handleUpdateProfile = async () => {
    setError("");
    setSuccessMessage("");

    if (newPassword && newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token || !userId) {
      setError("You must be logged in to update your profile");
      return;
    }

    // Check if user is trying to update profile without making any changes
    const response = await fetch("/api/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      setError("Failed to fetch current user data");
      return;
    }

    const currentUserData = await response.json();

    // Create object to hold only changed fields
    const updatedFields = {};

    // Only include fields that have changed
    if (firstName !== currentUserData.firstName) {
      updatedFields.firstName = firstName;
    }

    if (lastName !== currentUserData.lastName) {
      updatedFields.lastName = lastName;
    }

    if (email !== currentUserData.email) {
      updatedFields.email = email;
    }

    // Only include password if user is updating it
    if (newPassword) {
      updatedFields.oldPassword = password;
      updatedFields.newPassword = newPassword;
    }

    // If nothing has changed and no password update, show message
    if (Object.keys(updatedFields).length === 0) {
      setSuccessMessage("No changes to update");
      return;
    }

    try {
      const updateResponse = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedFields),
      });

      const data = await updateResponse.json();

      if (updateResponse.ok) {
        setSuccessMessage("Profile updated successfully!");
        // Clear password fields after successful update
        setPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(data.error || "Failed to update profile");
      }
    } catch (err) {
      setError("Network error, please try again");
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (!confirmed) return;

    const token = localStorage.getItem("token");
    if (!token || !userId) {
      setError("You must be logged in to delete your account");
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Clear token and redirect to login page
        localStorage.removeItem("token");
        setToggleSideBar(false);
        setShowAllFiles(false);
        setShowUserSettings(false);
        // You might want to redirect to login screen here
        // setShowLoginScreen(true);
        alert("Your account has been deleted successfully");
      } else {
        const data = await response.json();
        setError(data.error || "Failed to delete account");
      }
    } catch (err) {
      setError("Network error, please try again");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToggleSideBar(false);
    setShowAllFiles(false);
    setShowUserSettings(false);
    // Optionally: reload the page or redirect to login
    window.location.reload(); // or use your own login screen toggle
  };

  const handleResetAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete all your files? This cannot be undone."
    );

    if (!confirmed) return;

    const token = localStorage.getItem("token");
    if (!token || !userId) {
      setError("You must be logged in to reset your account");
      return;
    }

    try {
      const response = await fetch(`/api/files/reset/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("All files deleted successfully");

        // ✅ Clear the file list in app state
        if (typeof setFiles === "function") {
          setFiles([]);
        }

        // ✅ Optionally close the settings panel after a short delay
        setTimeout(() => {
          setShowUserSettings(false);
        }, 1000);
      } else {
        setError(data.error || "Failed to reset account");
      }
    } catch (err) {
      setError("Network error, please try again");
    }
  };

  return (
    <div className="userSettingsSection">
      <div className="userSettingsHeader">
        <h2>User Settings</h2>
      </div>

      <div className="settingsSection">
        <h3>Profile Information</h3>
        <div className="profileInputDiv">
          <p>First Name:</p>
          <input
            className="profileInput"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div className="profileInputDiv">
          <p>Last Name:</p>
          <input
            className="profileInput"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <div className="profileInputDiv">
          <p>Email:</p>
          <input
            className="profileInput"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div className="settingsSection">
        <h3>Change Password</h3>
        <div className="profileInputDiv">
          <p>Current Password:</p>
          <input
            className="profileInput"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="profileInputDiv">
          <p>New Password:</p>
          <input
            className="profileInput"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div className="profileInputDiv">
          <p>Confirm New Password:</p>
          <input
            className="profileInput"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
      </div>

      <div className="themeToggleSection">
        <h3>Appearance</h3>
        <div className="themeToggleDiv">
          <p>Theme:</p>
          <button className="toggleThemeButton" onClick={toggleTheme}>
            {isDarkMode ? (
              <>
                <i className="fa-solid fa-sun sunIcon"></i> Light Mode
              </>
            ) : (
              <>
                <i className="fa-solid fa-moon moonIcon"></i> Dark Mode
              </>
            )}
          </button>
        </div>
      </div>

      {error && <p className="errorText">{error}</p>}
      {successMessage && <p className="successText">{successMessage}</p>}

      <div className="settingsButtonsDiv">
        <button className="updateProfileButton" onClick={handleUpdateProfile}>
          Update Profile
        </button>
        <button className="resetAccountButton" onClick={handleResetAccount}>
          Reset Account (Delete All Files)
        </button>
        <button className="deleteAccountButton" onClick={handleDeleteAccount}>
          Delete Account
        </button>
        <button className="logoutButton" onClick={handleLogout}>
          Log Out
        </button>
        <button className="backToMainButton" onClick={handleCloseSettings}>
          Back to Main Menu
        </button>
      </div>
    </div>
  );
}
