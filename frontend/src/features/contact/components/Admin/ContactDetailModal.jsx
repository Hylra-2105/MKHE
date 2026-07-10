import React, { useState, useEffect } from "react";
import { X, Building2, User, Mail, Phone, MessageSquare, AlertCircle, Info, Trash2, UserPlus } from "lucide-react";
import Dropdown from "@/components/ui/Dropdown";
import Button from '@/components/ui/Button';
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function ContactDetailModal({ contact, isOpen, onClose, onUpdateStatus, onDelete }) {
  const { t } = useTranslation("admin");
  const [currentStatus, setCurrentStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  const getInterestDisplay = (interestKey) => {
    const interestMap = {
      "support": t("contacts.interest_support"),
      "b2b": t("contacts.interest_b2b"),
      "vip": t("contacts.interest_gifts"),
      "design": t("contacts.interest_design"),
      "boardgame": t("contacts.interest_boardgame"),
      "other": t("contacts.interest_other")
    };
    return interestMap[interestKey] || interestKey;
  };

  useEffect(() => {
    if (contact) {
      setCurrentStatus(contact.status);
    }
  }, [contact]);

  if (!isOpen || !contact) return null;

  const handleSave = async () => {
    if (currentStatus === contact.status) return;
    setIsSaving(true);
    try {
      await onUpdateStatus(contact._id, currentStatus);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleCreateUser = () => {
    navigate("/admin/users?action=create-b2b", { 
      state: { 
        name: contact.name, 
        email: contact.email, 
        company: contact.companyName,
        taxCode: contact.taxCode
      } 
    });
    onClose();
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 animate-in fade-in duration-300"
    >
      <div className="relative bg-[var(--color-mkhe-bg)] w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-[var(--color-mkhe-border)]/30 transition-colors">
        {/* HEADER */}
        <div className="flex justify-between items-center p-5 border-b border-[var(--color-mkhe-border)]/20 shrink-0 transition-colors bg-[var(--color-mkhe-bg)]">
          <h2 className="text-xl font-bold text-gradient-gold flex items-center gap-2">
            <Info className="w-5 h-5 text-[var(--color-mkhe-primary)]" />
            {t("contacts.detail_title")}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--color-mkhe-border)]/20 rounded-full transition-all cursor-pointer text-[var(--color-mkhe-text)]/60 hover:text-[var(--color-mkhe-primary)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 overflow-y-auto space-y-8 bg-[var(--color-mkhe-bg)] text-[var(--color-mkhe-text)] flex-1 custom-scrollbar">
          {/* Row 1: Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-[var(--color-mkhe-text)]/50 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <User className="w-4 h-4 text-[var(--color-mkhe-primary)]" />
                  {t("contacts.name")}
                </label>
                <div className="text-base font-medium text-[var(--color-mkhe-text)]">{contact.name}</div>
              </div>
              
              <div>
                <label className="text-xs font-bold text-[var(--color-mkhe-text)]/50 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Mail className="w-4 h-4 text-[var(--color-mkhe-primary)]" />
                  {t("contacts.email")}
                </label>
                <div className="text-base font-medium text-[var(--color-mkhe-text)]">{contact.email}</div>
              </div>
              
              <div>
                <label className="text-xs font-bold text-[var(--color-mkhe-text)]/50 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Phone className="w-4 h-4 text-[var(--color-mkhe-primary)]" />
                  {t("contacts.phone")}
                </label>
                <div className="text-base font-medium text-[var(--color-mkhe-text)]">{contact.phone}</div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-[var(--color-mkhe-text)]/50 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Building2 className="w-4 h-4 text-[var(--color-mkhe-primary)]" />
                  {t("contacts.company")}
                </label>
                <div className="text-base font-medium text-[var(--color-mkhe-text)]">
                  {contact.companyName || <span className="text-[var(--color-mkhe-text)]/40 italic font-normal">{t("contacts.none")}</span>}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--color-mkhe-text)]/50 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Info className="w-4 h-4 text-[var(--color-mkhe-primary)]" />
                  {t("contacts.tax_code")}
                </label>
                <div className="text-base font-medium text-[var(--color-mkhe-text)]">
                  {contact.taxCode || <span className="text-[var(--color-mkhe-text)]/40 italic font-normal">{t("contacts.none")}</span>}
                </div>
              </div>

              <div className="bg-[var(--color-mkhe-primary)]/5 p-4 rounded-xl border border-[var(--color-mkhe-border)]/20">
                <label className="text-xs font-bold text-[var(--color-mkhe-text)]/70 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                  <AlertCircle className="w-4 h-4 text-[var(--color-mkhe-primary)]" />
                  {t("contacts.update_status")}
                </label>
                <Dropdown
                  value={currentStatus}
                  options={[
                    { value: "PENDING", label: t("contacts.status_pending") },
                    { value: "CONTACTED", label: t("contacts.status_contacted") },
                    { value: "RESOLVED", label: t("contacts.status_resolved") }
                  ]}
                  onChange={setCurrentStatus}
                  className="w-full text-sm font-medium"
                  triggerClassName="h-10 px-4 rounded-lg bg-[var(--color-mkhe-bg)] border-[var(--color-mkhe-border)]/50 hover:border-[var(--color-mkhe-primary)] transition-colors text-sm"
                  optionClassName="text-sm"
                />
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-[var(--color-mkhe-border)]/20"></div>

          {/* Row 2: Message Details */}
          <div>
            <label className="text-xs font-bold text-[var(--color-mkhe-text)]/50 uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <AlertCircle className="w-4 h-4 text-[var(--color-mkhe-primary)]" />
              {t("contacts.interest")}
            </label>
            <div className="text-base p-4 bg-[var(--color-mkhe-bg)] border border-[var(--color-mkhe-border)]/30 rounded-xl font-medium">
              {getInterestDisplay(contact.interest)}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--color-mkhe-text)]/50 uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <MessageSquare className="w-4 h-4 text-[var(--color-mkhe-primary)]" />
              {t("contacts.content")}
            </label>
            <div className="text-base p-4 bg-[var(--color-mkhe-bg)] border border-[var(--color-mkhe-border)]/30 rounded-xl min-h-[120px] whitespace-pre-wrap leading-relaxed">
              {contact.message || <span className="text-[var(--color-mkhe-text)]/40 italic">{t("contacts.no_content")}</span>}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between p-5 border-t border-[var(--color-mkhe-border)]/20 shrink-0 bg-[var(--color-mkhe-bg)]">
          <div className="flex gap-3">
            <button
              onClick={() => onDelete(contact._id)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 rounded-lg transition-all duration-300 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              {t("contacts.delete_request")}
            </button>
            {(contact.interest === "b2b" || contact.interest?.includes("Tài khoản Doanh nghiệp")) && (
              <button
                onClick={handleCreateUser}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold border border-[var(--color-mkhe-primary)] text-[var(--color-mkhe-primary)] hover:bg-[var(--color-mkhe-primary)]/10 rounded-lg transition-all duration-300 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                {t("contacts.create_account")}
              </button>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-6 py-2.5 bg-[var(--color-mkhe-border)]/40 text-[var(--color-mkhe-text)] font-bold rounded-lg hover:bg-[var(--color-mkhe-border)]/50 transition-all disabled:opacity-50 text-sm cursor-pointer"
            >
              {t("contacts.cancel")}
            </button>
            <Button
              onClick={handleSave}
              disabled={isSaving || currentStatus === contact.status}
              className="!w-auto px-8 py-2.5 rounded-xl text-sm"
            >
              {isSaving ? t("contacts.saving") : t("contacts.save")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
