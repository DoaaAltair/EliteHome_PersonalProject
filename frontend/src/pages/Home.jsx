import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { hasRole, getCurrentUser } from "../utils/api";
import "../App.css";

export default function Home() {
    const navigate = useNavigate();

    useEffect(() => {
        if (hasRole("owner")) {
            navigate("/owner");
        }
    }, [navigate]);

    return (
        <div className="home-page">
            <section className="home-hero">
            </section>

            <section className="home-main-content">
                <div className="content-container">
                    <h2 className="section-title">What would you like to do?</h2>

                    <div className="action-cards">
                        <div className="action-card">
                            <div className="action-icon">🏠</div>
                            <p className="action-text">Add a new Apartment to the system.</p>
                            <button className="btn-action">+ Add Apartment</button>
                        </div>

                        <div className="action-card">
                            <div className="action-icon">📄</div>
                            <p className="action-text">Create and manage invoices for apartments</p>
                            <button className="btn-action">+ Add Invoice</button>
                        </div>

                        <div className="action-card">
                            <div className="action-icon">💰</div>
                            <p className="action-text">Add financial details for an apartment</p>
                            <button className="btn-action">+ Add Financial</button>
                        </div>
                    </div>
                </div>
            </section>

            <section className="home-notifications-section">
                <div className="content-container">
                    <h2 className="section-title">Latest Notifications</h2>
                    <div className="notifications-list">
                        <div className="notification-item">
                            <p className="notification-text">
                                apartment nummer 55 his apartment needs to be repaired 21-10-2025, 10:47:03
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
