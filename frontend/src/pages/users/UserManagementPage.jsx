import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllUsersApi } from "@/api/userApi";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next"; // 1. Import i18n

import UserFilter from "@/features/users/components/UserFilter";
import UserTable from "@/features/users/components/UserTable";
import ForbiddenPage from "@/pages/errors/ForbiddenPage";

export default function UserManagement() {
  const navigate = useNavigate();
  const { t } = useTranslation("admin"); // 2. Khởi tạo hook dịch (nhớ truyền đúng tên file json)

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isForbidden, setIsForbidden] = useState(false);

  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getAllUsersApi(page, limit, appliedSearch, roleFilter);

      if (res.success) {
        setUsers(res.data);
        setTotalPages(res.pagination.totalPages);
      }
    } catch (error) {
      // 3. XỬ LÝ LỖI 403
      const errorStatus = error.response?.status;
      const errorCode = error.response?.data?.message;

      if (errorStatus === 403) {
        setIsForbidden(true);
        return;
      }

      if (errorCode) {
        // Tìm bản dịch trong file json (ví dụ: errors.FORBIDDEN_ACCESS)
        toast.error(t(`errors.${errorCode}`, { defaultValue: errorCode }));
      } else {
        toast.error(t("errors.fetch_failed"));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, appliedSearch, roleFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setAppliedSearch(searchInput);
  };

  const handleRoleChange = (e) => {
    setPage(1);
    setRoleFilter(e.target.value);
  };

  // Nếu bị từ chối truy cập, hiển thị trang 403
  if (isForbidden) {
    return <ForbiddenPage />;
  }

  return (
    <div className="p-6 bg-mkhe-bg min-h-screen text-mkhe-text">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold font-logo text-gradient-gold mb-1">
            {t("users.title")}
          </h1>
          <p className="text-sm text-mkhe-text/60 italic">
            {t("users.subtitle")}
          </p>
        </div>
        <button className="bg-mkhe-primary text-white px-5 py-2.5 rounded shadow hover:opacity-90 transition font-semibold">
          {t("users.add_member")}
        </button>
      </div>

      {/* FILTER & TABLE */}
      {/* Lưu ý: Nếu trong UserFilter và UserTable cũng có chữ cứng, bạn cũng nên truyền 't' xuống hoặc gọi useTranslation trong các file đó nhé */}
      <UserFilter
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        roleFilter={roleFilter}
        handleRoleChange={handleRoleChange}
        handleSearch={handleSearch}
      />

      <UserTable users={users} loading={loading} />

      {/* PAGINATION */}
      {!loading && totalPages > 0 && (
        <div className="flex justify-between items-center mt-6">
          <span className="text-sm text-mkhe-text/60">
            {t("pagination.showing_page")}{" "}
            <span className="font-bold text-mkhe-primary">{page}</span> /{" "}
            {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 border border-mkhe-border/50 rounded hover:bg-mkhe-primary/10 disabled:opacity-30 transition"
            >
              {t("pagination.prev")}
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-4 py-2 border rounded transition ${
                    page === pageNum
                      ? "bg-mkhe-primary text-white border-mkhe-primary shadow-md"
                      : "border-mkhe-border/50 hover:bg-mkhe-primary/10"
                  }`}
                >
                  {pageNum}
                </button>
              ),
            )}

            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 border border-mkhe-border/50 rounded hover:bg-mkhe-primary/10 disabled:opacity-30 transition"
            >
              {t("pagination.next")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
