import React, { useState } from "react";
import "../App.css";
import bgImage from "../assets/venice-mall.jpg";
import { useNavigate } from "react-router-dom";
import { apiRequest, API_ENDPOINTS } from "../utils/api";

export default function Login() {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (!name || !password) {
            setError("Please fill in both fields!");
            setLoading(false);
            return;
        }

        try {
            const data = await apiRequest(API_ENDPOINTS.LOGIN, {
                method: "POST",
                body: JSON.stringify({ username: name, password }),
            });

            if (data.token) localStorage.setItem("token", data.token);
            if (data.role) localStorage.setItem("role", data.role);
            localStorage.setItem("user", JSON.stringify({ username: data.username }));

            if (data.role === "admin") {
                alert(`Welcome admin ${data.username}!`);
                navigate("/admin");
            } else if (data.role === "staff") {
                alert(`Welcome ${data.username}!`);
                navigate("/home");
            } else if (data.role === "owner") {
                alert(`Welcome owner ${data.username}!`);
                navigate("/owner");
            } else {
                navigate("/home");
            }
            console.log(import.meta.env.VITE_API_URL);

        } catch (err) {
            console.error("Login error:", err);
            console.error("Error details:", {
                message: err.message,
                code: err.code,
                details: err.details
            });
            // Show the actual error message from the server
            const errorMessage = err.message || "Login failed. Please check your credentials.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page-background" style={{ backgroundImage: `url(${bgImage})` }}>
            <div className="login-overlay">
                <div className="login-card-container">
                    <div className="login-logo-container">
                        <img
                            src="/Elite_Home.png"
                            alt="Elite Home Logo"
                            className="login-logo-img"
                        />
                    </div>

                    <p className="login-subtitle">Secure access to your Elite Home account.</p>

                    <form className="login-form" onSubmit={handleLogin}>
                        <div className="login-input-group">
                            <input
                                id="username"
                                type="text"
                                placeholder="user name…"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoComplete="username"
                                className="login-input"
                            />
                        </div>

                        <div className="login-input-group">
                            <input
                                id="password"
                                type="password"
                                placeholder="Password…"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                className="login-input"
                            />
                        </div>

                        {error && <p className="login-error">{error}</p>}

                        <button
                            className="login-button"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Log In"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}