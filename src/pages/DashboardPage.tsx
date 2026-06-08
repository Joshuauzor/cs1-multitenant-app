import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/useAuth";
import { getReports } from "../api/api";
import MultiStepForm from "../components/MultiStepForm";
import { INTERVENTION_TYPES } from "../types";
import type { Report } from "../types";
import "./DashboardPage.css";

function interventionLabel(value: string | null): string {
  if (!value) return "—";
  return (
    INTERVENTION_TYPES.find((t) => t.value === value)?.label ?? value
  );
}

export default function DashboardPage() {
  const { auth, logout } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshReports = useCallback(async () => {
    try {
      const data = await getReports();
      setReports(data);
    } catch {
      // silently ignore — user stays on page
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    getReports()
      .then((data) => {
        if (!cancelled) setReports(data);
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
    void refreshReports();
  };

  const tenantLabel =
    auth?.tenant_name ?? auth?.user.tenant_id ?? "Workspace";

  return (
    <div className="dash-root">
      <header className="dash-header">
        <div className="dash-brand">
          <span className="dash-logo">◈</span>
          <span className="dash-brand-name">CaseForm</span>
          <span className="dash-tenant-badge">{tenantLabel}</span>
        </div>
        <div className="dash-header-right">
          <span className="dash-user">{auth?.user.email}</span>
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
              {reports.length}{" "}
              {reports.length === 1 ? "report" : "reports"} in your workspace
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
        ) : reports.length === 0 ? (
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
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td>{report.first_name}</td>
                    <td>{report.last_name}</td>
                    <td>{report.location}</td>
                    <td>
                      <span className="dash-badge">
                        {interventionLabel(report.intervention_type)}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`dash-status dash-status--${report.status}`}
                      >
                        {report.status === "completed" ? "Completed" : "Draft"}
                      </span>
                    </td>
                    <td className="dash-date">
                      {new Date(report.created_at).toLocaleDateString()}
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
