import React, { useState, useEffect } from "react";
import { FileDown, Eye, Trash2, Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { contactApi } from "@/api/contactApi";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import Dropdown from "@/components/ui/Dropdown";
import { useSocketStore } from "@/stores/useSocketStore";
import ContactDetailModal from "./ContactDetailModal";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function ContactManagementFeature() {
  const { t } = useTranslation("admin");
  const navigate = useNavigate();
  const location = useLocation();

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [interestFilter, setInterestFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const limit = 6;

  const fetchContacts = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit,
        status: statusFilter,
        interest: interestFilter,
        search: appliedSearch
      };

      const res = await contactApi.getAllContacts(params);
      setContacts(res.data?.data?.contacts || []);
      setTotalPages(res.data?.data?.totalPages || 1);
    } catch (err) {
      console.error(err);
      toast.error(t("admin:errors.fetch_failed", "Lỗi khi tải dữ liệu liên hệ"));
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, interestFilter, appliedSearch, limit, t]);

  const handleSearch = () => {
    setCurrentPage(1);
    setAppliedSearch(searchInput);
  };

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const openContactId = location.state?.openContactId || params.get("openContactId");
    
    if (openContactId) {
      const fetchAndOpen = async () => {
        try {
          const res = await contactApi.getContactById(openContactId);
          if (res.data?.data) {
            setSelectedContact(res.data.data);
            setIsModalOpen(true);
          }
          if (location.state?.openContactId) {
            navigate(location.pathname, { replace: true, state: {} });
          } else {
            navigate(location.pathname, { replace: true });
          }
        } catch (error) {
          console.error("Failed to fetch contact by ID:", error);
          if (location.state?.openContactId) {
            navigate(location.pathname, { replace: true, state: {} });
          } else {
            navigate(location.pathname, { replace: true });
          }
        }
      };
      fetchAndOpen();
    }
  }, [location.search, location.state, location.pathname, navigate]);

  const { socket } = useSocketStore();

  useEffect(() => {
    if (socket) {
      const handleUpdate = () => {
        fetchContacts();
      };
      
      socket.on("admin_contact_updated", handleUpdate);
      
      const handleAdminNotif = (notif) => {
        if (notif?.type === "CONTACT") {
          fetchContacts();
        }
      };
      socket.on("new_admin_notification", handleAdminNotif);

      return () => {
        socket.off("admin_contact_updated", handleUpdate);
        socket.off("new_admin_notification", handleAdminNotif);
      };
    }
  }, [socket, fetchContacts]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await contactApi.updateContactStatus(id, status);
      toast.success(t("admin:messages.update_success", "Cập nhật thành công"));
      fetchContacts();
    } catch (err) {
      console.error(err);
      toast.error(t("admin:messages.update_error", "Cập nhật thất bại"));
    }
  };

  const handleDeleteContact = async () => {
    if (!contactToDelete) return;
    setIsDeleting(true);
    try {
      await contactApi.deleteContact(contactToDelete);
      toast.success(t("contacts.delete_success_msg", "Xóa thành công"));
      setIsModalOpen(false);
      setContactToDelete(null);
      fetchContacts();
    } catch (error) {
      console.error("Failed to delete contact:", error);
      toast.error(t("admin:messages.delete_error", "Xóa thất bại"));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenModal = (contact) => {
    setSelectedContact(contact);
    setIsModalOpen(true);
  };


  const statusOptions = [
    { value: "", label: t("contacts.status_all") },
    { value: "PENDING", label: t("contacts.status_pending") },
    { value: "CONTACTED", label: t("contacts.status_contacted") },
    { value: "RESOLVED", label: t("contacts.status_resolved") },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/10 text-yellow-600 border border-yellow-500/30">{t("contacts.status_pending")}</span>;
      case "CONTACTED":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 border border-blue-500/30">{t("contacts.status_contacted")}</span>;
      case "RESOLVED":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-600 border border-green-500/30">{t("contacts.status_resolved")}</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-500/10 text-gray-600 border border-gray-500/30">{status}</span>;
    }
  };

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

  const interestOptions = [
    { value: "", label: t("contacts.interest_all") },
    { value: "support", label: t("contacts.interest_support") },
    { value: "b2b", label: t("contacts.interest_b2b") },
    { value: "vip", label: t("contacts.interest_gifts") },
    { value: "design", label: t("contacts.interest_design") },
    { value: "boardgame", label: t("contacts.interest_boardgame") },
    { value: "other", label: t("contacts.interest_other") },
  ];

  const pageNumbers = [currentPage - 1, currentPage, currentPage + 1];

  return (
    <div className="p-3 md:p-6 bg-mkhe-bg min-h-screen text-mkhe-text flex flex-col">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-logo text-gradient-gold mb-1">
            {t("contacts.title")}
          </h1>
          <p className="text-sm text-mkhe-text/60 italic">
            {t("contacts.subtitle")}
          </p>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-mkhe-bg p-3 md:p-4 rounded shadow mb-6 flex flex-col md:flex-row md:items-center gap-4 border border-mkhe-border/30">
        <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex-1 flex gap-2">
          <input
            type="text"
            placeholder={t("contacts.search_placeholder")}
            className="w-full h-10 px-3 bg-transparent border border-mkhe-border/50 text-mkhe-text rounded focus:outline-none focus:border-mkhe-primary transition-colors text-sm"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button
            type="submit"
            className="h-10 w-32 bg-mkhe-primary text-white px-4 cursor-pointer rounded hover:opacity-90 transition-opacity font-semibold shrink-0 text-sm"
          >
            {t("search", { ns: "common" })}
          </button>
        </form>

        <div className="w-full md:w-48 shrink-0">
          <Dropdown
            value={statusFilter}
            options={statusOptions}
            onChange={(val) => {
              setStatusFilter(val);
              setCurrentPage(1);
            }}
            placeholder={t("contacts.status_all")}
            className="w-full"
            triggerClassName="h-10 px-3 rounded"
            optionClassName="text-sm"
          />
        </div>
        <div className="w-full md:w-64 shrink-0">
          <Dropdown
            value={interestFilter}
            options={interestOptions}
            onChange={(val) => {
              setInterestFilter(val);
              setCurrentPage(1);
            }}
            placeholder={t("contacts.interest_all")}
            className="w-full"
            triggerClassName="h-10 px-3 rounded"
            optionClassName="text-sm"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className={`bg-mkhe-bg rounded shadow overflow-x-auto border border-mkhe-border/50 min-h-[420px] transition-opacity ${loading ? "opacity-60 pointer-events-none" : "opacity-100"}`}>
        <table className="w-full text-left border-collapse min-w-[1000px] whitespace-nowrap">
          <thead>
            <tr className="border-b border-mkhe-border/50 text-mkhe-text/70 uppercase text-sm bg-mkhe-primary/5">
              <th className="px-4 py-3 font-semibold w-[20%]">{t("contacts.customer")}</th>
              <th className="px-4 py-3 font-semibold w-[25%]">{t("contacts.contact")}</th>
              <th className="px-4 py-3 font-semibold w-[30%]">{t("contacts.interest")}</th>
              <th className="px-4 py-3 font-semibold text-center w-[15%]">{t("contacts.status")}</th>
              <th className="px-4 py-3 font-semibold text-right w-[10%]">{t("contacts.actions")}</th>
            </tr>
          </thead>
          <tbody className="text-mkhe-text relative">
            {loading && (
              <tr className="absolute inset-0 h-full flex items-center justify-center bg-mkhe-bg/50 backdrop-blur-sm pointer-events-none">
                <td colSpan="5" className="text-center">
                  <div className="inline-block animate-spin">
                    <div className="w-8 h-8 border-4 border-mkhe-primary/20 border-t-mkhe-primary rounded-full"></div>
                  </div>
                </td>
              </tr>
            )}
            {!loading && contacts.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-mkhe-text/60">
                  <div className="flex flex-col items-center gap-3">
                    <FileDown className="w-10 h-10 text-mkhe-text/20" />
                    <p>{t("contacts.no_requests")}</p>
                  </div>
                </td>
              </tr>
            ) : (
              contacts.map((contact) => (
                <tr
                  key={contact._id}
                  className="border-b border-mkhe-border/50 hover:bg-mkhe-primary/5 transition-colors last:border-b-0"
                >
                  <td className="px-4 py-2.5">
                    <div className="font-medium">{contact.name}</div>
                    {contact.companyName && (
                      <div className="flex items-center gap-1.5 text-[11px] text-mkhe-text/60 font-medium">
                        <Building2 className="w-3 h-3 text-mkhe-primary shrink-0" />
                        {contact.companyName}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="text-sm">{contact.email}</div>
                    <div className="text-xs text-mkhe-text/60 mt-1">{contact.phone}</div>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="text-sm text-mkhe-text/90 max-w-[300px] truncate font-medium" title={getInterestDisplay(contact.interest)}>
                      {getInterestDisplay(contact.interest)}
                    </div>
                    <div className="text-xs text-mkhe-text/50 mt-1 truncate max-w-[300px]" title={contact.message}>
                      {contact.message || <span className="italic">{t("contacts.no_content")}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {getStatusBadge(contact.status)}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenModal(contact)}
                        className="p-2 bg-mkhe-primary/10 text-mkhe-primary hover:bg-mkhe-primary/20 rounded-full transition-colors cursor-pointer flex items-center justify-center w-9 h-9 shrink-0"
                        title={t("contacts.view_detail")}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setContactToDelete(contact._id)}
                        className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-full transition-colors cursor-pointer flex items-center justify-center w-9 h-9 shrink-0"
                        title={t("contacts.delete_request")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* DIVIDER */}
      <div className="h-px bg-mkhe-border/30 my-7"></div>

      {/* PAGINATION */}
      {totalPages > 0 && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-mkhe-text/60">
            {t("pagination.showing_page", "Đang hiển thị trang")}{" "}
            <span className="font-bold text-mkhe-primary">{currentPage}</span> / {totalPages}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className={`px-2 py-1 rounded transition-colors mr-2 ${
                currentPage === 1
                  ? "invisible"
                  : "text-mkhe-primary cursor-pointer hover:bg-mkhe-primary/20"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              &lt;
            </button>

            {pageNumbers.map((pageNum) => {
              const isValid = pageNum >= 1 && pageNum <= totalPages;
              const isActive = currentPage === pageNum;

              return (
                <button
                  key={pageNum}
                  onClick={() => isValid && setCurrentPage(pageNum)}
                  disabled={loading || !isValid}
                  className={`w-10 h-10 flex justify-center items-center transition-all duration-300 mx-1 ${
                    !isValid
                      ? "invisible w-8"
                      : isActive
                        ? "text-2xl text-mkhe-primary scale-80 cursor-pointer"
                        : "text-base font-medium cursor-pointer text-mkhe-text/50 hover:text-mkhe-primary"
                  } bg-transparent border-none outline-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              className={`px-2 py-1 rounded transition-colors font-bold ml-2 ${
                currentPage === totalPages
                  ? "invisible"
                  : "text-mkhe-primary cursor-pointer hover:bg-mkhe-primary/20"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              &gt;
            </button>
          </div>
        </div>
      )}
      
      {/* Contact Detail Modal */}
      <ContactDetailModal
        contact={selectedContact}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdateStatus={(id, status) => {
          handleUpdateStatus(id, status);
          setSelectedContact(prev => ({ ...prev, status }));
        }}
        onDelete={() => setContactToDelete(selectedContact._id)}
      />

      <ConfirmModal
        isOpen={!!contactToDelete}
        onCancel={() => setContactToDelete(null)}
        onConfirm={handleDeleteContact}
        title={t("contacts.confirm_delete_title")}
        message={t("contacts.confirm_delete_desc")}
        confirmText={t("contacts.delete")}
        cancelText={t("contacts.cancel")}
        isDanger={true}
        loading={isDeleting}
        icon="trash"
      />
    </div>
  );
}
