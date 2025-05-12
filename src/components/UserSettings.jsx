import React, { useState, useEffect } from "react";
import jwt_decode from "jwt-decode";
import { getBaseUrlWithEnv } from "../assets/utils/backendConnect";
import { toast } from "react-hot-toast";

export default function UserSettings({
  setShowUserSettings,
  setToggleSideBar,
  setShowAllFiles,
  toggleTheme,
  isDarkMode,
  handleClose,
  setFiles,
  email,
  setEmail,
  setShowTutorial,
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const decoded = jwt_decode(token);
          setUserId(decoded.userId);

          const response = await fetch(`${getBaseUrlWithEnv()}/api/profile`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
          });

          if (response.ok) {
            const userData = await response.json();
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
    if (newPassword && newPassword !== confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token || !userId) {
      alert("You must be logged in to update your profile");
      return;
    }

    // ✅ Change to:
    const response = await fetch(`${getBaseUrlWithEnv()}/api/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      alert("Failed to fetch current user data");
      return;
    }

    const currentUserData = await response.json();

    const updatedFields = {};

    if (firstName !== currentUserData.firstName) {
      updatedFields.firstName = firstName;
    }

    if (lastName !== currentUserData.lastName) {
      updatedFields.lastName = lastName;
    }

    if (email !== currentUserData.email) {
      updatedFields.email = email;
    }

    if (newPassword) {
      updatedFields.oldPassword = password;
      updatedFields.newPassword = newPassword;
    }

    if (Object.keys(updatedFields).length === 0) {
      toast("No changes to update");
      return;
    }

    try {
      // ✅ Change to:
      const updateResponse = await fetch(
        `${getBaseUrlWithEnv()}/api/users/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedFields),
        }
      );

      const data = await updateResponse.json();

      if (updateResponse.ok) {
        toast.success("Profile updated successfully!");
        setPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        alert(data.error || "Failed to update profile");
      }
    } catch (err) {
      alert("Network error, please try again");
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
      const response = await fetch(
        `${getBaseUrlWithEnv()}/api/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        localStorage.removeItem("token");
        setToggleSideBar(false);
        setShowAllFiles(false);
        setShowUserSettings(false);
        alert("Your account has been deleted successfully");
        window.location.reload(); // 👈 Instant reload
      } else {
        const data = await response.json();
        setError(data.error || "Failed to delete account");
      }
    } catch (err) {
      setError("Network error, please try again");
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const isGuest = localStorage.getItem("isGuest") === "true";

    if (isGuest && userId && token) {
      try {
        await fetch(`${getBaseUrlWithEnv()}/api/files/reset/${userId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        await fetch(`${getBaseUrlWithEnv()}/api/users/${userId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error("Guest cleanup failed:", err);
      }
    }

    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("isGuest");

    setToggleSideBar(false);
    setShowAllFiles(false);
    setShowUserSettings(false);

    toast.success("Logged out successfully");
    setTimeout(() => {
      window.location.reload();
    }, 1000);
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
      const response = await fetch(
        `${getBaseUrlWithEnv()}/api/files/reset/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("All your files have been deleted successfully.");

        if (typeof setFiles === "function") {
          setFiles([]);
        }

        setShowUserSettings(false);
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

      {/* Top Priority Buttons */}
      <div className="settingsButtonsDiv">
        <button
          className="showTutorialButton"
          onClick={() => setShowTutorial(true)}
        >
          Show Tutorial
        </button>
      </div>

      {/* Profile Info */}
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

      {/* Password Section */}
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

      {/* Update & Reset Buttons */}
      <div className="settingsButtonsDiv">
        <button className="updateProfileButton" onClick={handleUpdateProfile}>
          Update Profile
        </button>
        <button className="resetAccountButton" onClick={handleResetAccount}>
          Reset Account (Delete All Files)
        </button>
      </div>

      {/* Theme Toggle */}
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

      {/* Danger Zone */}
      <div className="settingsButtonsDiv">
        <button className="deleteAccountButton" onClick={handleDeleteAccount}>
          Delete Account
        </button>
        <button className="backToMainButton" onClick={handleCloseSettings}>
          Back to Main Menu
        </button>
        <button className="logoutButton" onClick={handleLogout}>
          Log Out
        </button>
      </div>

      {/* Optional: Error Display */}
      {error && <p className="errorText">{error}</p>}
    </div>
  );
}
