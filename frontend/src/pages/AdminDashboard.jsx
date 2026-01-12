import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { getCurrentUser, apiRequest, API_ENDPOINTS, hasRole } from "../utils/api";

export default function AdminDashboard() {
    const navigate = useNavigate();
    const user = getCurrentUser();
    const [activeTab, setActiveTab] = useState("Overview");
    const [stats, setStats] = useState({
        users: {
            total_users: 0,
            admin_count: 0,
            owner_count: 0,
            staff_count: 0,
            blocked_users: 0
        },
        apartments: {
            total_apartments: 0,
            available_apartments: 0,
            rented_apartments: 0
        },
        invoices: {
            total_invoices: 0,
            total_revenue: 0
        }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!hasRole("admin")) {
            navigate("/home");
        }
    }, [navigate]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await apiRequest(API_ENDPOINTS.ADMIN_STATS, {
                    method: "GET"
                });
                setStats(data);
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };

        if (hasRole("admin")) {
            fetchStats();
        }
    }, []);

    if (!hasRole("admin")) {
        return null;
    }

    if (loading) {
        return (
            <div className="admin-dashboard">
                <div className="layout-container">
                    <div className="admin-loading">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <div className="layout-container">
                <h1 className="admin-page-title">Admin Dashboard</h1>

                <div className="admin-tabs-container">
                    <button
                        className={`admin-tab ${activeTab === "Overview" ? "active" : ""}`}
                        onClick={() => setActiveTab("Overview")}
                    >
                        Overview
                    </button>
                    <button
                        className={`admin-tab ${activeTab === "Users" ? "active" : ""}`}
                        onClick={() => setActiveTab("Users")}
                    >
                        Users
                    </button>
                    <button
                        className={`admin-tab ${activeTab === "Notifications" ? "active" : ""}`}
                        onClick={() => setActiveTab("Notifications")}
                    >
                        Notifications
                    </button>
                    <button
                        className={`admin-tab ${activeTab === "Invoices" ? "active" : ""}`}
                        onClick={() => setActiveTab("Invoices")}
                    >
                        Invoices
                    </button>
                    <button
                        className={`admin-tab ${activeTab === "Owner Management" ? "active" : ""}`}
                        onClick={() => setActiveTab("Owner Management")}
                    >
                        Owner Management
                    </button>
                </div>

                {activeTab === "Overview" && (
                    <div className="admin-overview-grid">
                        <div className="admin-stat-card card-1-4">
                            <h3 className="card-title">Users</h3>
                            <div className="card-number">{stats.users.total_users || 0}</div>
                            <div className="card-details-box">
                                <div className="card-detail-item">
                                    <span>Admins:</span>
                                    <span>{stats.users.admin_count || 0}</span>
                                </div>
                                <div className="card-detail-item">
                                    <span>Owners:</span>
                                    <span>{stats.users.owner_count || 0}</span>
                                </div>
                                <div className="card-detail-item">
                                    <span>Staff:</span>
                                    <span>{stats.users.staff_count || 0}</span>
                                </div>
                                <div className="card-detail-item">
                                    <span>Blocked:</span>
                                    <span>{stats.users.blocked_users || 0}</span>
                                </div>
                            </div>
                        </div>

                        <div className="admin-stat-card card-5-8">
                            <h3 className="card-title">Apartments</h3>
                            <div className="card-number">{stats.apartments.total_apartments || 0}</div>
                            <div className="card-details-box">
                                <div className="card-detail-item">
                                    <span>Available:</span>
                                    <span>{stats.apartments.available_apartments || 0}</span>
                                </div>
                                <div className="card-detail-item">
                                    <span>Rented:</span>
                                    <span>{stats.apartments.rented_apartments || 0}</span>
                                </div>
                            </div>
                        </div>

                        <div className="admin-stat-card card-9-12">
                            <h3 className="card-title">Revenue</h3>
                            <div className="card-number">
                                {stats.invoices.total_revenue
                                    ? `${Math.round(stats.invoices.total_revenue)} $`
                                    : "0 $"}
                            </div>
                            <div className="card-details-box">
                                <div className="card-detail-item">
                                    <span>Total Invoices:</span>
                                    <span>{stats.invoices.total_invoices || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "Users" && (
                    <div className="admin-tab-content">
                        <p>Users management - Coming soon</p>
                    </div>
                )}

                {activeTab === "Notifications" && (
                    <div className="admin-tab-content">
                        <p>Notifications management - Coming soon</p>
                    </div>
                )}

                {activeTab === "Invoices" && (
                    <div className="admin-tab-content">
                        <p>Invoices management - Coming soon</p>
                    </div>
                )}

                {activeTab === "Owner Management" && (
                    <div className="admin-tab-content">
                        <p>Owner management - Coming soon</p>
                    </div>
                )}
            </div>
        </div>
    );
}
