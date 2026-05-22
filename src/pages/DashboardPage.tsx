import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/useAuth";
import { getForms } from "../api/api";
import MultiStepForm from "../components/MultiStepForm";
import type { FormEntry } from "../types";
import "./DashboardPage.css";

export default function DashboardPage() {
  const { auth, logout } = useAuth();
  const [entries, setEntries] = useState<FormEntry[]>([]);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshEntries = useCallback(async () => {
    try {
      const data = await getForms();
      setEntries(data);
    } catch {
      // silently ignore — user stays on page
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    getForms()
      .then((data) => {
        if (!cancelled) setEntries(data);
      })
      .catch(() => {
        // silently ignore — user stays on page
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleFormSuccess = () => {
    setShowForm(false);
    void refreshEntries();
  };

  const tenantLabel = auth?.tenantName ?? auth?.tenantId ?? "Workspace";

  return (
    <div className="dash-root">
      <header className="dash-header">
        <div className="dash-brand">
          <span className="dash-logo">◈</span>
          <span className="dash-brand-name">CaseForm</span>
          <span className="dash-tenant-badge">{tenantLabel}</span>
        </div>
        <div className="dash-header-right">
          <span className="dash-user">{auth?.email}</span>
          <button className="dash-logout" type="button" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>

      <main className="dash-main">
        <div className="dash-top-bar">
          <div>
            <h1 className="dash-page-title">Incident Reports</h1>
            <p className="dash-page-sub">
              {entries.length} {entries.length === 1 ? "entry" : "entries"} in your workspace
            </p>
          </div>
          <button
            className="dash-new-btn"
            type="button"
            onClick={() => setShowForm(true)}
          >
            + New Report
          </button>
        </div>

        {loading ? (
          <div className="dash-empty">Loading…</div>
        ) : entries.length === 0 ? (
          <div className="dash-empty">
            <span className="dash-empty-icon">○</span>
            <p>No reports yet. Create your first one.</p>
          </div>
        ) : (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>First name</th>
                  <th>Last name</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.first_name}</td>
                    <td>{entry.last_name}</td>
                    <td>{entry.location}</td>
                    <td>
                      <span className="dash-badge">{entry.selection_value}</span>
                    </td>
                    <td className="dash-date">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {showForm && (
        <MultiStepForm
          onSuccess={handleFormSuccess}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
