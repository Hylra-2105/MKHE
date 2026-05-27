import React from "react";
// Import Icon nếu bạn có (ví dụ: SearchIcon), ở đây mình dùng text cho nhanh

const UserFilter = ({
  searchInput,
  setSearchInput,
  roleFilter,
  handleRoleChange,
  handleSearch,
}) => {
  return (
    <div className="bg-mkhe-bg p-4 rounded shadow mb-6 flex flex-col md:flex-row gap-4 border border-mkhe-border/30">
      <form onSubmit={handleSearch} className="flex-1 flex gap-2">
        <input
          type="text"
          placeholder="Tìm theo tên hoặc email..."
          className="w-full bg-transparent border border-mkhe-border/50 text-mkhe-text p-2 rounded focus:outline-none focus:border-mkhe-primary transition-colors"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button
          type="submit"
          className="bg-mkhe-primary text-white px-6 py-2 rounded hover:opacity-90 transition-opacity font-semibold"
        >
          Tìm
        </button>
      </form>

      <select
        className="bg-transparent border border-mkhe-border/50 text-mkhe-text p-2 rounded focus:outline-none focus:border-mkhe-primary transition-colors min-w-[200px]"
        value={roleFilter}
        onChange={handleRoleChange}
      >
        <option value="" className="bg-mkhe-bg">
          Tất cả Vai trò
        </option>
        <option value="Customer" className="bg-mkhe-bg">
          Customer
        </option>
        <option value="Staff" className="bg-mkhe-bg">
          Staff
        </option>
        <option value="Admin" className="bg-mkhe-bg">
          Admin
        </option>
      </select>
    </div>
  );
};

export default UserFilter;
