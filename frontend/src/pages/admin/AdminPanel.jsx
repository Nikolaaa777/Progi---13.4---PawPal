import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import "../../styles/walks.css";

const AdminPanel = () => {
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [usersError, setUsersError] = useState(null);

    const [clanarina, setClanarina] = useState({ iznos: "", updated_at: null });
    const [iznosInput, setIznosInput] = useState("");
    const [loadingClanarina, setLoadingClanarina] = useState(true);
    const [savingClanarina, setSavingClanarina] = useState(false);
    const [clanarinaError, setClanarinaError] = useState(null);

    const [search, setSearch] = useState("");

    useEffect(() => {
        loadUsers();
        loadClanarina();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadUsers = async () => {
        try {
            setUsersError(null);
            setLoadingUsers(true);
            const data = await api.adminUsersList();
            setUsers(Array.isArray(data) ? data : []);
        } catch (e) {
            setUsersError(e?.message || "Ne mogu učitati korisnike.");
        } finally {
            setLoadingUsers(false);
        }
    };

    const loadClanarina = async () => {
        try {
            setClanarinaError(null);
            setLoadingClanarina(true);
            const data = await api.adminClanarinaGet();
            const iznos = data?.iznos ?? "";
            setClanarina({ iznos, updated_at: data?.updated_at ?? null });
            setIznosInput(iznos);
        } catch (e) {
            setClanarinaError(e?.message || "Ne mogu učitati članarinu.");
        } finally {
            setLoadingClanarina(false);
        }
    };

    const filteredUsers = useMemo(() => {
        const q = (search || "").trim().toLowerCase();
        if (!q) return users;
        return users.filter((u) => {
            const email = (u.email || "").toLowerCase();
            const idStr = String(u.id ?? "");
            return email.includes(q) || idStr.includes(q);
        });
    }, [users, search]);

    const disableUser = async (userId) => {
        try {
            await api.adminUserDisable(userId);
            setUsers((prev) =>
                prev.map((u) => (u.id === userId ? { ...u, is_active: false } : u)),
            );
        } catch (e) {
            alert(e?.message || "Disable nije uspio.");
        }
    };

    const enableUser = async (userId) => {
        try {
            await api.adminUserEnable(userId);
            setUsers((prev) =>
                prev.map((u) => (u.id === userId ? { ...u, is_active: true } : u)),
            );
        } catch (e) {
            alert(e?.message || "Enable nije uspio.");
        }
    };

    const saveClanarina = async () => {
        const iznos = (iznosInput || "").toString().trim();
        if (!iznos) {
            alert("Unesi iznos.");
            return;
        }

        try {
            setSavingClanarina(true);
            const data = await api.adminClanarinaUpdate(iznos);
            const newIznos = data?.iznos ?? iznos;
            setClanarina({
                iznos: newIznos,
                updated_at: data?.updated_at ?? clanarina.updated_at,
            });
            alert("Članarina ažurirana.");
        } catch (e) {
            alert(e?.message || "Update članarine nije uspio.");
        } finally {
            setSavingClanarina(false);
        }
    };

    return (
        <div className="availableWalks">
            <aside className="availableWalks__filters">
                <button
                    className="availableWalks__back"
                    onClick={() => navigate("/")}
                    aria-label="Natrag"
                >
                    ←
                </button>

                <h3>Admin panel</h3>

                <label>Search (email / id)</label>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="npr. marko@gmail.com ili 12"
                    style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                        marginTop: 8,
                        marginBottom: 16,
                    }}
                />

                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                    <button
                        className="availableWalks__book"
                        onClick={loadUsers}
                        style={{ flex: 1 }}
                    >
                        Refresh users
                    </button>
                    <button
                        className="availableWalks__book"
                        onClick={loadClanarina}
                        style={{ flex: 1 }}
                    >
                        Refresh članarina
                    </button>
                </div>

                <h4 style={{ margin: "8px 0 10px" }}>Članarina</h4>

                {loadingClanarina ? (
                    <div style={{ color: "#6b7280" }}>Učitavanje...</div>
                ) : clanarinaError ? (
                    <div
                        style={{
                            padding: 12,
                            background: "#fee2e2",
                            color: "#991b1b",
                            borderRadius: 8,
                        }}
                    >
                        {clanarinaError}
                    </div>
                ) : (
                    <div
                        style={{
                            padding: 12,
                            borderRadius: 12,
                            border: "1px solid #e5e7eb",
                            background: "white",
                        }}
                    >
                        <div style={{ marginBottom: 10 }}>
                            Trenutno: <strong>{clanarina.iznos}</strong>
                        </div>

                        {clanarina.updated_at && (
                            <div style={{ marginBottom: 10, color: "#6b7280", fontSize: 13 }}>
                                Updated: {String(clanarina.updated_at)}
                            </div>
                        )}

                        <label>Novi iznos</label>
                        <input
                            value={iznosInput}
                            onChange={(e) => setIznosInput(e.target.value)}
                            placeholder="npr. 9.99"
                            style={{
                                width: "100%",
                                padding: "10px",
                                borderRadius: "8px",
                                border: "1px solid #e5e7eb",
                                marginTop: 8,
                                marginBottom: 10,
                            }}
                        />

                        <button
                            className="availableWalks__book"
                            onClick={saveClanarina}
                            disabled={savingClanarina}
                            style={{
                                width: "100%",
                                background: savingClanarina ? "#9ca3af" : "#3b76ff",
                                cursor: savingClanarina ? "not-allowed" : "pointer",
                            }}
                        >
                            {savingClanarina ? "Spremam..." : "Spremi članarinu"}
                        </button>
                    </div>
                )}
            </aside>

            <section className="availableWalks__list">
                <h1 className="availableWalks__title">Korisnici</h1>

                {usersError && (
                    <div
                        style={{
                            padding: 12,
                            background: "#fee2e2",
                            color: "#991b1b",
                            marginBottom: 16,
                            borderRadius: 8,
                        }}
                    >
                        {usersError}
                    </div>
                )}

                {loadingUsers ? (
                    <div style={{ padding: "40px", textAlign: "center" }}>
                        Učitavanje...
                    </div>
                ) : (
                    <div
                        style={{
                            background: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: 12,
                            overflow: "hidden",
                        }}
                    >
                        <div
                            style={{
                                padding: 12,
                                borderBottom: "1px solid #e5e7eb",
                                color: "#6b7280",
                            }}
                        >
                            Prikazano:{" "}
                            <strong style={{ color: "#111827" }}>
                                {filteredUsers.length}
                            </strong>
                        </div>

                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ background: "#f9fafb", textAlign: "left" }}>
                                        <th
                                            style={{
                                                padding: 12,
                                                borderBottom: "1px solid #e5e7eb",
                                            }}
                                        >
                                            ID
                                        </th>
                                        <th
                                            style={{
                                                padding: 12,
                                                borderBottom: "1px solid #e5e7eb",
                                            }}
                                        >
                                            Email
                                        </th>
                                        <th
                                            style={{
                                                padding: 12,
                                                borderBottom: "1px solid #e5e7eb",
                                            }}
                                        >
                                            Active
                                        </th>
                                        <th
                                            style={{
                                                padding: 12,
                                                borderBottom: "1px solid #e5e7eb",
                                            }}
                                        >
                                            Staff
                                        </th>
                                        <th
                                            style={{
                                                padding: 12,
                                                borderBottom: "1px solid #e5e7eb",
                                            }}
                                        >
                                            Akcije
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} style={{ padding: 18, color: "#6b7280" }}>
                                                Nema korisnika za prikaz.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((u) => (
                                            <tr
                                                key={u.id}
                                                style={{ borderBottom: "1px solid #f3f4f6" }}
                                            >
                                                <td style={{ padding: 12 }}>{u.id}</td>
                                                <td style={{ padding: 12 }}>{u.email || "-"}</td>
                                                <td style={{ padding: 12 }}>
                                                    <span
                                                        style={{
                                                            padding: "4px 10px",
                                                            borderRadius: 999,
                                                            fontSize: 13,
                                                            background: u.is_active ? "#dcfce7" : "#fee2e2",
                                                            color: u.is_active ? "#166534" : "#991b1b",
                                                        }}
                                                    >
                                                        {u.is_active ? "ACTIVE" : "DISABLED"}
                                                    </span>
                                                </td>
                                                <td style={{ padding: 12 }}>
                                                    {u.is_staff ? "YES" : "NO"}
                                                </td>

                                                <td style={{ padding: 12 }}>
                                                    {u.is_active ? (
                                                        <button
                                                            onClick={() => disableUser(u.id)}
                                                            style={{
                                                                padding: "8px 12px",
                                                                borderRadius: 10,
                                                                border: "1px solid #e5e7eb",
                                                                background: "#fff",
                                                                cursor: "pointer",

                                                                // 👇 OVO je bitno (CSS override fix)
                                                                color: "#111827",
                                                                WebkitTextFillColor: "#111827",
                                                                fontSize: 14,
                                                                fontWeight: 600,
                                                                lineHeight: "20px",
                                                                display: "inline-flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                minWidth: 120,
                                                            }}
                                                        >
                                                            Disable user
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => enableUser(u.id)}
                                                            style={{
                                                                padding: "8px 12px",
                                                                borderRadius: 10,
                                                                border: "1px solid #e5e7eb",
                                                                background: "#fff",
                                                                cursor: "pointer",

                                                                // 👇 OVO je bitno (CSS override fix)
                                                                color: "#111827",
                                                                WebkitTextFillColor: "#111827",
                                                                fontSize: 14,
                                                                fontWeight: 600,
                                                                lineHeight: "20px",
                                                                display: "inline-flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                minWidth: 120,
                                                            }}
                                                        >
                                                            Enable user
                                                        </button>
                                                    )}
                                                </td>

                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
};

export default AdminPanel;
