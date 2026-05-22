import { useState, type ChangeEvent } from "react";
import { submitForm } from "../api/api";
import type { FormState, CreateFormEntryRequest } from "../types";
import { INTERVENTION_TYPES } from "../types";
import "./MultiStepForm.css";

type Step = 1 | 2;

interface Props {
  onSuccess: () => void;
  onClose: () => void;
}

const INITIAL_STATE: FormState = {
  firstName: "",
  lastName: "",
  location: "",
  selectionValue: "",
};

export default function MultiStepForm({ onSuccess, onClose }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const set =
    (key: keyof FormState) =>
    (e: ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const selectOption = (value: string) =>
    setForm((prev) => ({ ...prev, selectionValue: value }));

  const step1Valid =
    form.firstName.trim() !== "" &&
    form.lastName.trim() !== "" &&
    form.location.trim() !== "";

  const step2Valid = form.selectionValue !== "";

  const handleSubmit = async () => {
    if (!step2Valid) return;
    setLoading(true);
    setError("");
    try {
      const payload: CreateFormEntryRequest = {
        first_name: form.firstName,
        last_name: form.lastName,
        location: form.location,
        selection_value: form.selectionValue,
      };
      await submitForm(payload);
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
      <div className="modal-card" role="dialog" aria-modal="true" aria-label="New Incident Report">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">New Incident Report</h2>
            <p className="modal-step-label">Step {step} of 2</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="step-track" aria-hidden="true">
          <div className={`step-dot ${step >= 1 ? "active" : ""}`}><span>1</span></div>
          <div className={`step-line ${step >= 2 ? "filled" : ""}`} />
          <div className={`step-dot ${step >= 2 ? "active" : ""}`}><span>2</span></div>
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

            <div className="modal-footer">
              <button className="btn-ghost" type="button" onClick={onClose}>
                Cancel
              </button>
              <button
                className="btn-primary"
                type="button"
                onClick={() => setStep(2)}
                disabled={!step1Valid}
              >
                Continue →
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

            <div className="option-grid" role="listbox" aria-label="Intervention type">
              {INTERVENTION_TYPES.map((t) => (
                <button
                  key={t}
                  role="option"
                  aria-selected={form.selectionValue === t}
                  className={`option-btn ${form.selectionValue === t ? "selected" : ""}`}
                  type="button"
                  onClick={() => selectOption(t)}
                >
                  {t}
                </button>
              ))}
            </div>

            {error && <p className="form-error" role="alert">{error}</p>}

            <div className="modal-footer">
              <button
                className="btn-ghost"
                type="button"
                onClick={() => setStep(1)}
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
