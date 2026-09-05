import React, { useState, useEffect } from "react";
import { X, Send, CheckCircle2, AlertCircle, Loader2, Building2, User, Mail, Phone, MessageSquare, Users, Briefcase, Tag } from "lucide-react";
import { EnquiryApi, EnquiryPayload } from "@/src/services/enquiryApi";
import "./EnquiryModal.css";

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: string | null;
}

export const EnquiryModal: React.FC<EnquiryModalProps> = ({ isOpen, onClose, initialPlan }) => {
  const [formData, setFormData] = useState<EnquiryPayload>({
    name: "",
    email: "",
    phone: "",
    instituteName: "",
    role: "Owner / Director",
    studentCount: "100 - 500 students",
    message: ""
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pre-fill message/plan when initialPlan is passed
  useEffect(() => {
    if (initialPlan) {
      setFormData((prev) => ({
        ...prev,
        message: `I am interested in the ${initialPlan} plan for my institute. Please share pricing and demo details.`
      }));
    }
  }, [initialPlan]);

  // Lock body scroll when modal is open & handle ESC key
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage(null);
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setErrorMessage("Please enter your full name.");
      return false;
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      setErrorMessage("Please enter a valid email address.");
      return false;
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 5) {
      setErrorMessage("Please enter a valid phone number.");
      return false;
    }
    if (!formData.instituteName.trim()) {
      setErrorMessage("Please enter your institute or academy name.");
      return false;
    }
    if (!formData.message.trim()) {
      setErrorMessage("Please enter a brief message or requirement.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await EnquiryApi.submitEnquiry(formData);
      if (res.success) {
        setIsSuccess(true);
      } else {
        setErrorMessage(res.message || "Failed to submit enquiry. Please try again.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setErrorMessage(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      instituteName: "",
      role: "Owner / Director",
      studentCount: "100 - 500 students",
      message: initialPlan
        ? `I am interested in the ${initialPlan} plan for my institute. Please share pricing and demo details.`
        : ""
    });
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <div className="enquiry-modal__overlay" onClick={handleClose}>
      <div
        className="enquiry-modal__container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="enquiry-modal-title"
      >
        {/* Header */}
        <div className="enquiry-modal__header">
          <div>
            <div className="enquiry-modal__badge">
              <Building2 size={14} />
              <span>Eduvora SaaS Onboarding</span>
            </div>
            <h2 id="enquiry-modal-title" className="enquiry-modal__title">
              {isSuccess
                ? "Enquiry Sent!"
                : initialPlan
                ? `Enquire for ${initialPlan}`
                : "Request a Demo & Enquiry"}
            </h2>
            <p className="enquiry-modal__subtitle">
              {isSuccess
                ? "Our institute onboarding specialist will get back to you shortly."
                : "Fill out the form below to enquire about plans, custom pricing, or request a live platform demo."}
            </p>
            {initialPlan && !isSuccess && (
              <div className="enquiry-modal__plan-tag">
                <Tag size={13} />
                <span>Selected Plan: <strong>{initialPlan}</strong></span>
              </div>
            )}
          </div>
          <button
            type="button"
            className="enquiry-modal__close-btn"
            onClick={handleClose}
            aria-label="Close Enquiry Modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="enquiry-modal__content">
          {isSuccess ? (
            <div className="enquiry-modal__success-wrapper">
              <div className="enquiry-modal__success-icon-box">
                <CheckCircle2 size={48} />
              </div>
              <h3>Thank You, {formData.name}!</h3>
              <p className="enquiry-modal__success-msg">
                We have received your enquiry for <strong>{formData.instituteName}</strong>. 
                A representative will contact you at <strong>{formData.email}</strong> or <strong>{formData.phone}</strong> within 24 hours.
              </p>

              <div className="enquiry-modal__summary-card">
                <div className="enquiry-modal__summary-item">
                  <span className="summary-label">Institute:</span>
                  <span className="summary-value">{formData.instituteName}</span>
                </div>
                <div className="enquiry-modal__summary-item">
                  <span className="summary-label">Role:</span>
                  <span className="summary-value">{formData.role}</span>
                </div>
                <div className="enquiry-modal__summary-item">
                  <span className="summary-label">Capacity:</span>
                  <span className="summary-value">{formData.studentCount}</span>
                </div>
                {initialPlan && (
                  <div className="enquiry-modal__summary-item">
                    <span className="summary-label">Plan Tier:</span>
                    <span className="summary-value">{initialPlan}</span>
                  </div>
                )}
              </div>

              <div className="enquiry-modal__success-actions">
                <button
                  type="button"
                  className="enquiry-modal__btn-secondary"
                  onClick={handleReset}
                >
                  Submit Another Enquiry
                </button>
                <button
                  type="button"
                  className="enquiry-modal__btn-primary"
                  onClick={handleClose}
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="enquiry-modal__form">
              {errorMessage && (
                <div className="enquiry-modal__error-banner">
                  <AlertCircle size={18} />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="enquiry-modal__grid">
                {/* Full Name */}
                <div className="enquiry-modal__field">
                  <label htmlFor="enquiry-name">
                    Full Name <span className="required">*</span>
                  </label>
                  <div className="enquiry-modal__input-wrapper">
                    <User size={18} className="input-icon" />
                    <input
                      id="enquiry-name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Dr. Rajesh Sharma"
                      required
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="enquiry-modal__field">
                  <label htmlFor="enquiry-email">
                    Email Address <span className="required">*</span>
                  </label>
                  <div className="enquiry-modal__input-wrapper">
                    <Mail size={18} className="input-icon" />
                    <input
                      id="enquiry-email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. rajesh@apexacademy.com"
                      required
                    />
                  </div>
                </div>

                {/* Phone / WhatsApp */}
                <div className="enquiry-modal__field">
                  <label htmlFor="enquiry-phone">
                    Phone / WhatsApp <span className="required">*</span>
                  </label>
                  <div className="enquiry-modal__input-wrapper">
                    <Phone size={18} className="input-icon" />
                    <input
                      id="enquiry-phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. +91 98765 43210"
                      required
                    />
                  </div>
                </div>

                {/* Institute Name */}
                <div className="enquiry-modal__field">
                  <label htmlFor="enquiry-institute">
                    Institute / School Name <span className="required">*</span>
                  </label>
                  <div className="enquiry-modal__input-wrapper">
                    <Building2 size={18} className="input-icon" />
                    <input
                      id="enquiry-institute"
                      type="text"
                      name="instituteName"
                      value={formData.instituteName}
                      onChange={handleChange}
                      placeholder="e.g. Apex International Institute"
                      required
                    />
                  </div>
                </div>

                {/* Role / Designation */}
                <div className="enquiry-modal__field">
                  <label htmlFor="enquiry-role">Your Role / Designation</label>
                  <div className="enquiry-modal__input-wrapper">
                    <Briefcase size={18} className="input-icon" />
                    <select
                      id="enquiry-role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                    >
                      <option value="Owner / Director">Owner / Director</option>
                      <option value="Principal / Headmaster">Principal / Headmaster</option>
                      <option value="Administrator / Academic Head">Administrator / Academic Head</option>
                      <option value="Teacher / Faculty">Teacher / Faculty</option>
                      <option value="IT / Systems Manager">IT / Systems Manager</option>
                      <option value="Student / Parent">Student / Parent</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Student Count */}
                <div className="enquiry-modal__field">
                  <label htmlFor="enquiry-studentCount">Estimated Students</label>
                  <div className="enquiry-modal__input-wrapper">
                    <Users size={18} className="input-icon" />
                    <select
                      id="enquiry-studentCount"
                      name="studentCount"
                      value={formData.studentCount}
                      onChange={handleChange}
                    >
                      <option value="Under 100 students">Under 100 students (Starter)</option>
                      <option value="100 - 500 students">100 - 500 students (Growth)</option>
                      <option value="500 - 2,000 students">500 - 2,000 students (Pro)</option>
                      <option value="2,000+ students">2,000+ students (Enterprise Multi-Campus)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="enquiry-modal__field enquiry-modal__field--full">
                <label htmlFor="enquiry-message">
                  Enquiry Details & Requirements <span className="required">*</span>
                </label>
                <div className="enquiry-modal__input-wrapper textarea-wrapper">
                  <MessageSquare size={18} className="input-icon textarea-icon" />
                  <textarea
                    id="enquiry-message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about your institute's requirements, custom module requests, or preferred demo timings..."
                    required
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="enquiry-modal__footer">
                <button
                  type="button"
                  className="enquiry-modal__btn-cancel"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="enquiry-modal__btn-submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="spin" />
                      <span>Sending Enquiry...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Enquiry</span>
                      <Send size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
