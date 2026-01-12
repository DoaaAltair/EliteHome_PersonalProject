import React, { useState, useEffect } from "react";
import "../App.css";
import { apiRequest, API_ENDPOINTS } from "../utils/api";

export default function Apartments() {
    const [apartments, setApartments] = useState([]);
    const [stage, setStage] = useState("idle");
    const [selectedType, setSelectedType] = useState("rent");
    const [form, setForm] = useState({
        type: "rent",
        employee: "",
        owner_name: "",
        number: "",
        description: "",
        status: "empty",
        household: ""
    });
    const [detail, setDetail] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [statusFilter, setStatusFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [householdFilter, setHouseholdFilter] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const fetchApartments = async () => {
            setLoading(true);
            setError("");
            try {
                const data = await apiRequest(API_ENDPOINTS.APARTMENTS);
                setApartments(data);
            } catch (err) {
                console.error("Error fetching apartments:", err);
                setError("Failed to load apartments");
            } finally {
                setLoading(false);
            }
        };
        fetchApartments();
    }, []);

    const startAddFlow = () => setStage("chooseType");
    const confirmType = () => setStage("form");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const payload = {
                ...form,
                type: selectedType,
                owner_name: form.owner_name || "",
            };

            const data = await apiRequest(API_ENDPOINTS.APARTMENTS, {
                method: "POST",
                body: JSON.stringify(payload),
            });

            const newApartment = { id: data.id, ...payload };
            setApartments([newApartment, ...apartments]);
            setForm({ type: "rent", employee: "", number: "", description: "", status: "empty", household: "" });
            setSelectedType("rent");
            setStage("idle");
        } catch (err) {
            console.error("Error creating apartment:", err);
            setError(err.message || "Failed to add apartment");
        } finally {
            setLoading(false);
        }
    };

    const openDetail = async (apt) => {
        try {
            const data = await apiRequest(`/api/apartments/${apt.id}`);
            setDetail(data);
            setEditForm(data);
            setIsEditing(false);
        } catch (err) {
            console.error("Error fetching apartment detail:", err);
            setDetail(apt);
            setEditForm(apt);
            setIsEditing(false);
        }
    };

    const closeDetail = () => { setDetail(null); setIsEditing(false); };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm((prev) => ({ ...prev, [name]: value }));
    };

    const saveEdits = async () => {
        setLoading(true);
        setError("");

        try {
            const payload = {
                type: editForm.type || "",
                employee: editForm.employee || "",
                owner_name: editForm.owner_name || "",
                number: editForm.number || "",
                description: editForm.description || "",
                status: editForm.status || "empty",
                household: editForm.household || "",
            };

            const data = await apiRequest(`/api/apartments/${detail.id}`, {
                method: "PUT",
                body: JSON.stringify(payload),
            });

            setDetail(data);
            setApartments((prev) => prev.map((a) => (a.id === data.id ? data : a)));
            setIsEditing(false);
        } catch (err) {
            console.error("Error updating apartment:", err);
            setError(err.message || "Update failed");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this apartment?")) return;

        setLoading(true);
        setError("");

        try {
            await apiRequest(`/api/apartments/${id}`, { method: "DELETE" });
            setApartments(apartments.filter((a) => a.id !== id));
            closeDetail();
        } catch (err) {
            console.error("Error deleting apartment:", err);
            setError(err.message || "Delete failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="apartment-page">
            <div className="layout-container">
                <div className="apartments-header">
                    <h2>Apartments</h2>
                    {stage === "idle" && (
                        <button className="btn-primary add-apartment-btn" onClick={startAddFlow}>Add Apartment</button>
                    )}
                </div>

                {error && <div className="alert error">{error}</div>}
                {loading && <div className="loading">Loading...</div>}

                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search by apartment number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button
                        className="btn-secondary"
                        type="button"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        {showFilters ? "Close Filters" : "Filter"}
                    </button>
                </div>

                {showFilters && (
                    <div className="filter-panel glass">
                        <div className="filter-group">
                            <label>Status</label>
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="">All</option>
                                <option value="empty">Empty</option>
                                <option value="rented">Rented</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Type</label>
                            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                                <option value="">All</option>
                                <option value="rent">For Rent</option>
                                <option value="sale">For Sale</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Household</label>
                            <select value={householdFilter} onChange={(e) => setHouseholdFilter(e.target.value)}>
                                <option value="">All</option>
                                <option value="with">With Household</option>
                                <option value="without">Without Household</option>
                            </select>
                        </div>

                        <div className="filter-actions">
                            <button className="btn-primary" type="button" onClick={() => setShowFilters(false)}>
                                Apply
                            </button>
                            <button className="btn-secondary" type="button" onClick={() => {
                                setStatusFilter("");
                                setTypeFilter("");
                                setHouseholdFilter("");
                            }}>
                                Reset
                            </button>
                        </div>
                    </div>
                )}

                {stage === "chooseType" && (
                    <div className="type-selector glass">
                        <h3>Choose a Type</h3>
                        <div className="type-options">
                            <button className={`type-card ${selectedType === "rent" ? "active" : ""}`} onClick={() => setSelectedType("rent")} type="button">
                                <span className="type-emoji">🔑</span>
                                <span>Rent</span>
                            </button>
                            <button className={`type-card ${selectedType === "sale" ? "active" : ""}`} onClick={() => setSelectedType("sale")} type="button">
                                <span className="type-emoji">🏷️</span>
                                <span>Sale</span>
                            </button>
                        </div>
                        <div className="type-actions">
                            <button className="btn-secondary" type="button" onClick={() => setStage("idle")}>Cancel</button>
                            <button className="btn-primary btn-next" type="button" onClick={confirmType}>Next</button>
                        </div>
                    </div>
                )}

                {stage === "form" && (
                    <form className="apartment-form glass" onSubmit={handleSubmit}>
                        <div className="form-header">
                            <h3>New Apartment ({selectedType})</h3>
                            <button className="btn-secondary" type="button" onClick={() => setStage("idle")}>Back</button>
                        </div>

                        <label>Agent</label>
                        <input type="text" name="employee" value={form.employee} onChange={handleChange} />

                        <label>Owner</label>
                        <input
                            type="text"
                            name="owner_name"
                            value={form.owner_name || ""}
                            onChange={handleChange}
                        />


                        <label>Number</label>
                        <input type="text" name="number" value={form.number} onChange={handleChange} />

                        <label>Description</label>
                        <textarea name="description" value={form.description} onChange={handleChange}></textarea>

                        <label>Status</label>
                        <select name="status" value={form.status} onChange={handleChange}>
                            <option value="empty">Empty</option>
                            <option value="rented">Rented</option>
                        </select>

                        <label>Household</label>
                        <textarea name="household" value={form.household} onChange={handleChange}></textarea>

                        <button className="btn-primary" type="submit">Save</button>
                    </form>
                )}

                <div className="apartments-grid">
                    {apartments.length === 0 && <p className="subtle">No apartments yet.</p>}
                    {apartments
                        .filter((apt) => {
                            const matchesStatus = !statusFilter || (apt.status || "").toLowerCase() === statusFilter.toLowerCase();
                            const matchesType = !typeFilter || (apt.type || "").toLowerCase() === typeFilter.toLowerCase();
                            const hasHousehold = (apt.household || "").trim() !== "";
                            const matchesHousehold = !householdFilter ||
                                (householdFilter === "with" && hasHousehold) ||
                                (householdFilter === "without" && !hasHousehold);
                            const matchesSearch = !searchTerm ||
                                String(apt.number || "").toLowerCase().includes(searchTerm.toLowerCase());

                            return matchesStatus && matchesType && matchesHousehold && matchesSearch;
                        })
                        .map((apt) => {
                            const isEmpty = (apt.status || "").toLowerCase() === "empty";
                            return (
                                <button key={apt.id} className="apartment-card icon-card clickable"
                                    onClick={() => openDetail(apt)} type="button" title={`Apartment ${apt.number || ""}`}>
                                    <div className="icon">🏠</div>
                                    <div className="apartment-info">
                                        <span className="apartment-number">{apt.number || "—"}</span>
                                        <span className={`status-dot ${isEmpty ? "status-green" : "status-red"}`} />
                                    </div>
                                </button>
                            );
                        })}
                </div>
            </div>

            {detail && (
                <div className="modal-backdrop" onClick={closeDetail}>
                    <div className="modal glass" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Apartment Details</h3>
                            <button className="icon-btn" onClick={closeDetail} type="button">✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-row">
                                <span className="label">Type</span>
                                {isEditing ? (
                                    <select name="type" value={editForm.type || "rent"} onChange={handleEditChange}>
                                        <option value="rent">Rent</option>
                                        <option value="sale">Sale</option>
                                    </select>
                                ) : (
                                    <span>{detail.type === "rent" ? "Rent" : "Sale"}</span>
                                )}
                            </div>
                            <div className="detail-row">
                                <span className="label">Number</span>
                                {isEditing ? (
                                    <input name="number" type="text" value={editForm.number || ""} onChange={handleEditChange} />
                                ) : (
                                    <span>{detail.number || "—"}</span>
                                )}
                            </div>
                            <div className="detail-row">
                                <span className="label">Agent</span>
                                {isEditing ? (
                                    <input name="employee" type="text" value={editForm.employee || ""} onChange={handleEditChange} />
                                ) : (
                                    <span>{detail.employee || "—"}</span>
                                )}
                            </div>
                            <div className="detail-row">
                                <span className="label">Owner</span>
                                {isEditing ? (
                                    <input
                                        name="owner_name"
                                        type="text"
                                        value={editForm.owner_name || ""}
                                        onChange={handleEditChange}
                                    />
                                ) : (
                                    <span>{detail.owner_name || "—"}</span>
                                )}
                            </div>
                            <div className="detail-row">
                                <span className="label">Status</span>
                                {isEditing ? (
                                    <select name="status" value={editForm.status || "empty"} onChange={handleEditChange}>
                                        <option value="empty">Empty</option>
                                        <option value="rented">Rented</option>
                                    </select>
                                ) : (
                                    <span>{detail.status}</span>
                                )}
                            </div>
                            <div className="detail-row">
                                <span className="label">Description</span>
                                {isEditing ? (
                                    <textarea name="description" value={editForm.description || ""} onChange={handleEditChange}></textarea>
                                ) : (
                                    <span>{detail.description || "No description"}</span>
                                )}
                            </div>
                            <div className="detail-row">
                                <span className="label">Photo URL</span>
                                {isEditing ? (
                                    <input name="photo" type="text" value={editForm.photo || ""} onChange={handleEditChange} />
                                ) : (
                                    <span>{detail.photo || "—"}</span>
                                )}
                            </div>
                            <div className="detail-row">
                                <span className="label">Household</span>
                                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    {isEditing ? (
                                        <textarea name="household" value={editForm.household || ""} onChange={handleEditChange}></textarea>
                                    ) : (
                                        <span>{detail.household || "—"}</span>
                                    )}
                                    {!isEditing && (
                                        <button
                                            className="icon-btn"
                                            type="button"
                                            title={String(detail.household || "").trim().startsWith("✅") ? "Mark as not done" : "Mark as done"}
                                            onClick={async () => {
                                                try {
                                                    const wantDone = !String(detail.household || "").trim().startsWith("✅");
                                                    const data = await apiRequest(`/api/apartments/${detail.id}/household-done`, {
                                                        method: "PATCH",
                                                        body: JSON.stringify({ done: wantDone })
                                                    });
                                                    setDetail(data);
                                                    setApartments((prev) => prev.map((a) => (a.id === data.id ? data : a)));
                                                } catch (err) {
                                                    console.error("Error toggling household status:", err);
                                                }
                                            }}
                                        >
                                            {String(detail.household || "").trim().startsWith("✅") ? "☑" : "☐"}
                                        </button>
                                    )}
                                </span>
                            </div>
                        </div>
                        <div className="modal-footer">
                            {!isEditing ? (
                                <>
                                    <button className="btn-secondary" type="button" onClick={() => { setIsEditing(true); setEditForm(detail); }}>Edit</button>
                                    <button className="btn-danger" type="button" onClick={() => handleDelete(detail.id)}>Delete Apartment</button>
                                </>
                            ) : (
                                <>
                                    <button className="btn-secondary" type="button" onClick={() => { setIsEditing(false); setEditForm(detail); }}>Cancel</button>
                                    <button className="btn-primary" type="button" onClick={saveEdits}>Save</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
