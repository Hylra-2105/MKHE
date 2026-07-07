import React, { useState, useEffect } from "react";
import { UserPlus, FileDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { contactApi } from "@/api/contactApi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Dropdown from "@/components/ui/Dropdown";

export default function ContactManagementFeature() {
  const { t } = useTranslation("admin");
  const navigate = useNavigate();

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [interestFilter, setInterestFilter] = useState("");
  const limit = 10;

  const fetchContacts = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = { page: currentPage, limit };
      if (statusFilter) params.status = statusFilter;
      if (interestFilter) params.interest = interestFilter;

      const res = await contactApi.getAllContacts(params);
      setContacts(res.data?.contacts || []);
      setTotal(res.data?.total || 0);
      setTotalPages(res.data?.totalPages || 1);
    } catch (err) {
      console.error(err);
      toast.error(t("admin:errors.fetch_failed", "Lỗi khi tải dữ liệu liên hệ"));
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, interestFilter, limit, t]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

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

  const handleCreateB2B = (contact) => {
    navigate("/admin/users?action=create-b2b", {
      state: {
        name: contact.name,
        email: contact.email,
        company: contact.company,
      },
    });
  };

  const statusOptions = [
    { value: "", label: "Tất cả trạng thái" },
    { value: "PENDING", label: "Chờ xử lý" },
    { value: "CONTACTED", label: "Đã liên hệ" },
    { value: "RESOLVED", label: "Đã giải quyết" },
  ];

  const interestOptions = [
    { value: "", label: "Tất cả nhu cầu" },
    { value: "Yêu cầu mở Tài khoản Doanh nghiệp (B2B Portal)", label: "Doanh nghiệp (B2B Portal)" },
    { value: "Tư vấn Dịch vụ quà tặng Doanh nghiệp (B2B Gifts)", label: "Quà tặng Doanh nghiệp" },
    { value: "Tìm hiểu về Nhượng quyền & Đại lý", label: "Nhượng quyền & Đại lý" },
    { value: "Dịch vụ khác", label: "Khác" },
  ];

  const pageNumbers = [currentPage - 1, currentPage, currentPage + 1];

  return (
    <div className="p-3 md:p-6 bg-mkhe-bg min-h-screen text-mkhe-text flex flex-col">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-logo text-gradient-gold mb-1">
            Quản lý Liên hệ
          </h1>
          <p className="text-sm text-mkhe-text/60 italic">
            Danh sách các yêu cầu liên hệ từ khách hàng
          </p>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-mkhe-bg p-3 md:p-4 rounded shadow mb-6 flex flex-col md:flex-row md:items-center gap-4 border border-mkhe-border/30">
        <div className="w-full md:w-48">
          <Dropdown
            value={statusFilter}
            options={statusOptions}
            onChange={(val) => {
              setStatusFilter(val);
              setCurrentPage(1);
            }}
            placeholder="Tất cả trạng thái"
            className="w-full"
            triggerClassName="h-10 px-3 rounded"
            optionClassName="text-sm"
          />
        </div>
        <div className="w-full md:w-64">
          <Dropdown
            value={interestFilter}
            options={interestOptions}
            onChange={(val) => {
              setInterestFilter(val);
              setCurrentPage(1);
            }}
            placeholder="Tất cả nhu cầu"
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
              <th className="px-4 py-3 font-semibold w-1/4">Khách hàng</th>
              <th className="px-4 py-3 font-semibold w-1/4">Liên hệ</th>
              <th className="px-4 py-3 font-semibold w-1/4">Nhu cầu</th>
              <th className="px-4 py-3 font-semibold text-center w-1/6">Trạng thái</th>
              <th className="px-4 py-3 font-semibold text-center">Hành động</th>
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
                    <p>Không có yêu cầu liên hệ nào</p>
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
                    {contact.company && (
                      <div className="text-xs text-mkhe-text/60 mt-1 flex items-center gap-1">
                        <span className="inline-block w-2 h-2 rounded-full bg-mkhe-primary/50"></span>
                        {contact.company}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="text-sm">{contact.email}</div>
                    <div className="text-xs text-mkhe-text/60 mt-1">{contact.phone}</div>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="text-sm text-mkhe-text/80 max-w-[250px] truncate" title={contact.interest}>
                      {contact.interest}
                    </div>
                    <div className="text-xs text-mkhe-text/50 mt-1 truncate max-w-[250px]" title={contact.message}>
                      {contact.message}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <Dropdown
                      value={contact.status}
                      options={[
                        { value: "PENDING", label: "Chờ xử lý" },
                        { value: "CONTACTED", label: "Đã liên hệ" },
                        { value: "RESOLVED", label: "Đã giải quyết" }
                      ]}
                      onChange={(val) => handleUpdateStatus(contact._id, val)}
                      className="w-full text-xs font-medium"
                      triggerClassName="h-8 px-2 rounded bg-transparent border-mkhe-border/50 text-xs"
                      optionClassName="text-xs"
                    />
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {contact.company && (
                      <button
                        onClick={() => handleCreateB2B(contact)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-mkhe-primary text-white text-xs font-medium rounded hover:opacity-90 transition-opacity shadow-sm"
                        title="Tạo tài khoản B2B cho khách hàng này"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Cấp TK B2B</span>
                      </button>
                    )}
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
    </div>
  );
}
