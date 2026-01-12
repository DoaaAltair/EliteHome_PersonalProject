
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { hasRole, logout, getCurrentUser } from "../utils/api";

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const user = getCurrentUser();
    const profileDropdownRef = useRef(null);

    const isAdmin = hasRole("admin");
    const isOwnerOnly = hasRole("owner") && !isAdmin;

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setProfileDropdownOpen(false);
            }
        };

        if (profileDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [profileDropdownOpen]);

    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [menuOpen]);

    if (location.pathname === "/" || location.pathname === "/login") {
        return null;
    }

    return (
        <>
            <nav className="home-navbar">
                <div className="layout-container">
                    <div className="navbar-logo">
                        <img
                            src="/Elite_Home_logo.png"
                            alt="Elite Home Logo"
                            className="header-logo-img"
                        />
                    </div>

                    <ul className="navbar-nav">
                        {isOwnerOnly ? (
                            <li>
                                <Link to="/owner">Dashboard</Link>
                            </li>
                        ) : (
                            <>
                                <li><Link to="/home">Home</Link></li>
                                <li><Link to="/apartments">Apartments</Link></li>
                                <li><Link to="/invoices">Invoices</Link></li>
                                <li><Link to="/financial">Financial</Link></li>
                                {isAdmin && <li><Link to="/admin">Admin</Link></li>}
                            </>
                        )}
                    </ul>

                    <div className="navbar-right">
                        <button
                            type="button"
                            className={`nav-toggle ${menuOpen ? "open" : ""}`}
                            aria-label="Toggle navigation"
                            onClick={() => setMenuOpen(!menuOpen)}
                        >
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>

                        {user && (
                            <div className="navbar-profile" ref={profileDropdownRef}>
                                <button
                                    className="nav-profile-button"
                                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                    aria-label="Profile menu"
                                >
                                    <svg
                                        className="profile-icon"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                </button>
                                {profileDropdownOpen && (
                                    <div className="profile-dropdown">
                                        <div className="profile-dropdown-header">
                                            <div className="profile-dropdown-info">
                                                <div className="profile-dropdown-name">{user.username}</div>
                                                <div className="profile-dropdown-role">{user.role}</div>
                                            </div>
                                        </div>
                                        <div className="profile-dropdown-divider"></div>
                                        <button
                                            className="profile-dropdown-item"
                                            onClick={() => {
                                                setProfileDropdownOpen(false);
                                                handleLogout();
                                            }}
                                        >
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {menuOpen && (
                <div className="mobile-menu-overlay" onClick={() => setMenuOpen(false)}>
                    <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
                        <div className="mobile-menu-header">
                            <h3>Menu</h3>
                            <button
                                className="mobile-menu-close"
                                onClick={() => setMenuOpen(false)}
                                aria-label="Close menu"
                            >
                                ✕
                            </button>
                        </div>
                        <ul className="mobile-menu-list">
                            {isOwnerOnly ? (
                                <li>
                                    <Link to="/owner" onClick={() => setMenuOpen(false)}>
                                        Dashboard
                                    </Link>
                                </li>
                            ) : (
                                <>
                                    <li>
                                        <Link to="/home" onClick={() => setMenuOpen(false)}>
                                            Home
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/apartments" onClick={() => setMenuOpen(false)}>
                                            Apartments
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/invoices" onClick={() => setMenuOpen(false)}>
                                            Invoices
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/financial" onClick={() => setMenuOpen(false)}>
                                            Financial
                                        </Link>
                                    </li>
                                    {isAdmin && (
                                        <li>
                                            <Link to="/admin" onClick={() => setMenuOpen(false)}>
                                                Admin
                                            </Link>
                                        </li>
                                    )}
                                </>
                            )}
                        </ul>
                        {user && (
                            <div className="mobile-menu-footer">
                                <div className="mobile-menu-user">
                                    <div className="mobile-menu-user-name">{user.username}</div>
                                    <div className="mobile-menu-user-role">{user.role}</div>
                                </div>
                                <button
                                    className="btn-secondary mobile-menu-logout"
                                    onClick={() => {
                                        setMenuOpen(false);
                                        handleLogout();
                                    }}
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
