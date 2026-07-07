import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAllUsersApi } from "@/api/userApi";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSocketStore } from "@/stores/useSocketStore";

import UserFilter from "./Admin/UserFilter";
import UserTable from "@/features/users/components/Admin/UserTable";
import UserGrid from "@/features/users/components/Admin/UserGrid";
import UserDetailModal from "./Admin/UserDetailModal";
import AddUserModal from "@/features/users/components/Admin/AddUserModal";
import ForbiddenPage from "@/pages/errors/ForbiddenPage";

export default function UserManagementFeature() {
  const { t } = useTranslation(["admin", "common"]);
  const { user: currentUser } = useAuthStore();
  const { socket } = useSocketStore();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // list | grid
  const [isForbidden, setIsForbidden] = useState(false);

  const [page, setPage] = useState(1);
  const limit = viewMode === "grid" ? 8 : 6;
  const [totalPages, setTotalPages] = useState(1);

  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalInitialData, setAddModalInitialData] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Handle auto open modal for B2B creation
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("action") === "create-b2b" && location.state) {
      setAddModalInitialData({
        name: location.state.name,
        email: location.state.email,
        role: "Enterprise", // Pre-select Enterprise role
        companyName: location.state.company,
        taxCode: location.state.taxCode,
      });
      setIsAddModalOpen(true);
      // Clean up the URL to avoid reopening on refresh
      navigate("/admin/users", { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllUsersApi(page, limit, appliedSearch, roleFilter, statusFilter);

      if (res.success) {
        setUsers(res.data);
        setTotalPages(res.pagination.totalPages);
      }
    } catch (error) {
      const errorStatus = error.response?.status;
      const errorCode = error.response?.data?.message;

      if (errorStatus === 403) {
        setIsForbidden(true);
        return;
      }

      if (errorCode) {
        toast.error(
          t(`messages.${errorCode}`) ||
            t(errorCode, { ns: "common" }) ||
            errorCode,
        );
      } else {
        toast.error(t("errors.fetch_failed"));
      }
    } finally {
      setLoading(false);
    }
  }, [page, limit, appliedSearch, roleFilter, statusFilter, t]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (socket) {
      socket.on("user_updated", fetchUsers);
      return () => socket.off("user_updated", fetchUsers);
    }
  }, [socket, fetchUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setAppliedSearch(searchInput);
  };

  const handleRoleChange = (e) => {
    setPage(1);
    setRoleFilter(e.target.value);
  };

  const handleStatusChange = (e) => {
    setPage(1);
    setStatusFilter(e.target.value);
  };

  if (isForbidden) {
    return <ForbiddenPage />;
  }

  // Hiển thị 3 số trang
  const pageNumbers = [page - 1, page, page + 1];

  return (
    <div className="p-3 md:p-6 bg-mkhe-bg min-h-screen text-mkhe-text flex flex-col">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-logo text-gradient-gold mb-1">
            {t("users.title")}
          </h1>
          <p className="text-sm text-mkhe-text/60 italic">
            {t("users.subtitle")}
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-mkhe-primary text-white px-5 py-2.5 rounded shadow hover:opacity-90 transition font-semibold cursor-pointer"
        >
          {t("users.add_member")}
        </button>
      </div>

      {/* FILTER & TABLE */}
      <UserFilter
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        roleFilter={roleFilter}
        handleRoleChange={handleRoleChange}
        statusFilter={statusFilter}
        handleStatusChange={handleStatusChange}
        handleSearch={handleSearch}
        viewMode={viewMode}
        setViewMode={(mode) => {
          setViewMode(mode);
          setPage(1);
        }}
      />

      {viewMode === "list" ? (
        <UserTable
          users={users}
          loading={loading}
          onViewUser={handleViewUser}
          currentUser={currentUser}
        />
      ) : (
        <UserGrid
          users={users}
          loading={loading}
          onViewUser={handleViewUser}
          currentUser={currentUser}
        />
      )}

      {/* DIVIDER */}
      <div className="h-px bg-mkhe-border/30 my-7"></div>

      {/* PAGINATION */}
      {totalPages > 0 && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-mkhe-text/60">
            {t("pagination.showing_page")}{" "}
            <span className="font-bold text-mkhe-primary">{page}</span> /{" "}
            {totalPages}
          </span>

          <div className="flex items-center gap-1">

            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1 || loading}
              className={`px-2 py-1 rounded transition-colors mr-2 ${
                page === 1
                  ? "invisible"
                  : "text-mkhe-primary cursor-pointer hover:bg-mkhe-primary/20"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              &lt;
            </button>


            {pageNumbers.map((pageNum) => {
              const isValid = pageNum >= 1 && pageNum <= totalPages;
              const isActive = page === pageNum;

              return (
                <button
                  key={pageNum}
                  onClick={() => isValid && setPage(pageNum)}
                  disabled={loading || !isValid}
                  className={`w-10 h-10 flex justify-center items-center transition-all duration-300 mx-1 ${
                    !isValid
                      ? "invisible w-8"
                      : isActive
                        ? "text-2xl text-mkhe-primary scale-80 cursor-pointer"
                        : "text-base font-medium cursor-pointer text-mkhe-text/50 hover:text-mkhe-primary"
                  } bg-transparent border-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {pageNum}
                </button>
              );
            })}


            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages || loading}
              className={`px-2 py-1 rounded transition-colors font-bold ml-2 ${
                page === totalPages
                  ? "invisible"
                  : "text-mkhe-primary cursor-pointer hover:bg-mkhe-primary/20"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              &gt;
            </button>
          </div>
        </div>
      )}
      <UserDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
        onRefresh={fetchUsers}
      />
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setAddModalInitialData(null);
        }}
        onRefresh={fetchUsers}
        initialData={addModalInitialData}
      />
    </div>
  );
}
