import React, { useState, useEffect } from "react";
import "../App.css";
import { getCurrentUser, apiRequest, API_ENDPOINTS, hasRole } from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function OwnerDashboard() {
    const navigate = useNavigate();
    const user = getCurrentUser();
    const [stats, setStats] = useState({
        apartments: {
            total_apartments: 0,
            rented_count: 0,
            available_count: 0,
            yearly_income: 0
        },
        invoices: {
            total_invoices: 0,
            total_invoice_amount: 0
        }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!hasRole("owner")) {
            navigate("/home");
        }
    }, [navigate]);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            setError("");
            try {
                const data = await apiRequest(API_ENDPOINTS.OWNER_DASHBOARD, {
                    method: "GET"
                });
                setStats(data);
            } catch (err) {
                console.error("Error fetching owner stats:", err);
                setError("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        if (hasRole("owner")) {
            fetchStats();
        }
    }, []);

    if (!hasRole("owner")) {
        return null;
    }

    if (loading) {
        return (
            <div className="owner-dashboard">
                <div className="layout-container">
                    <div className="admin-loading">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="owner-dashboard">
            <div className="layout-container">
                <h1 className="admin-page-title">Owner Dashboard</h1>

                {error && <div className="alert error">{error}</div>}

                <div className="admin-overview-grid">
                    <div className="admin-stat-card card-1-4">
                        <h3 className="card-title">My Apartments</h3>
                        <div className="card-number">{stats.apartments?.total_apartments || 0}</div>
                        <div className="card-details-box">
                            <div className="card-detail-item">
                                <span>Total:</span>
                                <span>{stats.apartments?.total_apartments || 0}</span>
                            </div>
                            <div className="card-detail-item">
                                <span>Rented:</span>
                                <span>{stats.apartments?.rented_count || 0}</span>
                            </div>
                            <div className="card-detail-item">
                                <span>Available:</span>
                                <span>{stats.apartments?.available_count || 0}</span>
                            </div>
                        </div>
                    </div>

                    <div className="admin-stat-card card-5-8">
                        <h3 className="card-title">Invoices</h3>
                        <div className="card-number">{stats.invoices?.total_invoices || 0}</div>
                        <div className="card-details-box">
                            <div className="card-detail-item">
                                <span>Total:</span>
                                <span>{stats.invoices?.total_invoices || 0}</span>
                            </div>
                            <div className="card-detail-item">
                                <span>Total Amount:</span>
                                <span>
                                    {stats.invoices?.total_invoice_amount
                                        ? `€${Math.round(stats.invoices.total_invoice_amount)}`
                                        : "€0"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="admin-stat-card card-9-12">
                        <h3 className="card-title">Yearly Income</h3>
                        <div className="card-number">
                            {stats.apartments?.yearly_income
                                ? `€${Math.round(stats.apartments.yearly_income)}`
                                : "€0"}
                        </div>
                        <div className="card-details-box">
                            <div className="card-detail-item">
                                <span>Estimated:</span>
                                <span>
                                    {stats.apartments?.yearly_income
                                        ? `€${Math.round(stats.apartments.yearly_income)}`
                                        : "€0"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
