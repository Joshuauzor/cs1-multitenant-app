import { useState, type ChangeEvent } from "react";
import { createReportStepOne, completeReportStepTwo } from "../api/api";
import type { ReportFormState, InterventionType } from "../types";
import { INTERVENTION_TYPES } from "../types";
import "./MultiStepForm.css";

type Step = 1 | 2;

interface Props {
  onSuccess: () => void;
  onClose: () => void;
}

const INITIAL_STATE: ReportFormState = {
  firstName: "",
  lastName: "",
  location: "",
  interventionType: "",
};

export default function MultiStepForm({ onSuccess, onClose }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [reportId, setReportId] = useState<string | null>(null);
  const [form, setForm] = useState<ReportFormState>(INITIAL_STATE);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const set =
    (key: keyof ReportFormState) =>
    (e: ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const selectOption = (value: InterventionType) =>
    setForm((prev) => ({ ...prev, interventionType: value }));

  const step1Valid =
    form.firstName.trim() !== "" &&
    form.lastName.trim() !== "" &&
    form.location.trim() !== "";

  const step2Valid = form.interventionType !== "";

  const handleContinue = async () => {
    if (!step1Valid || loading) return;
    setLoading(true);
    setError("");
    try {
      const report = await createReportStepOne({
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        location: form.location.trim(),
      });
      setReportId(report.id);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save step 1");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!step2Valid || !reportId || loading) return;
    setLoading(true);
    setError("");
    try {
      await completeReportStepTwo(reportId, {
        intervention_type: form.interventionType as InterventionType,
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-label="New Incident Report"
      >
        <div className="modal-header">
          <div>
            <h2 className="modal-title">New Incident Report</h2>
            <p className="modal-step-label">Step {step} of 2</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="step-track" aria-hidden="true">
          <div className={`step-dot ${step >= 1 ? "active" : ""}`}>
            <span>1</span>
          </div>
          <div className={`step-line ${step >= 2 ? "filled" : ""}`} />
          <div className={`step-dot ${step >= 2 ? "active" : ""}`}>
            <span>2</span>
          </div>
        </div>

        {step === 1 && (
          <div className="modal-body">
            <p className="modal-section-title">Personal information</p>

            <div className="field-row">
              <div className="field">
                <label htmlFor="firstName">First name</label>
                <input
                  id="firstName"
                  type="text"
                  placeholder="Maria"
                  value={form.firstName}
                  onChange={set("firstName")}
                />
              </div>
              <div className="field">
                <label htmlFor="lastName">Last name</label>
                <input
                  id="lastName"
                  type="text"
                  placeholder="García"
                  value={form.lastName}
                  onChange={set("lastName")}
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="location">Location</label>
              <input
                id="location"
                type="text"
                placeholder="e.g. Madrid, Calle Gran Vía 12"
                value={form.location}
                onChange={set("location")}
              />
            </div>

            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}

            <div className="modal-footer">
              <button className="btn-ghost" type="button" onClick={onClose}>
                Cancel
              </button>
              <button
                className="btn-primary"
                type="button"
                onClick={handleContinue}
                disabled={!step1Valid || loading}
              >
                {loading ? "Saving…" : "Continue →"}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="modal-body">
            <p className="modal-section-title">Type of intervention</p>
            <p className="modal-hint">
              Select the category that best describes this incident.
            </p>

            <div
              className="option-grid"
              role="listbox"
              aria-label="Intervention type"
            >
              {INTERVENTION_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  role="option"
                  aria-selected={form.interventionType === value}
                  className={`option-btn ${form.interventionType === value ? "selected" : ""}`}
                  type="button"
                  onClick={() => selectOption(value)}
                >
                  {label}
                </button>
              ))}
            </div>

            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}

            <div className="modal-footer">
              <button
                className="btn-ghost"
                type="button"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                ← Back
              </button>
              <button
                className="btn-primary"
                type="button"
                onClick={handleSubmit}
                disabled={!step2Valid || loading}
              >
                {loading ? "Saving…" : "Submit report"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
