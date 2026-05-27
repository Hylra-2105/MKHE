import React from "react";

const UserTable = ({ users, loading }) => {
  return (
    <div className="bg-mkhe-bg rounded shadow overflow-x-auto border border-mkhe-border/30">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="border-b border-mkhe-border/30 text-mkhe-text/70 uppercase text-sm bg-mkhe-primary/5">
            <th className="p-4 font-semibold">Avatar</th>
            <th className="p-4 font-semibold">Họ và Tên</th>
            <th className="p-4 font-semibold">Email</th>
            <th className="p-4 font-semibold">Vai Trò</th>
            <th className="p-4 font-semibold text-center">Hành Động</th>
          </tr>
        </thead>
        <tbody className="text-mkhe-text">
          {loading ? (
            <tr>
              <td colSpan="5" className="p-8 text-center text-mkhe-text/60">
                Đang tải dữ liệu...
              </td>
            </tr>
          ) : users.length === 0 ? (
            <tr>
              <td colSpan="5" className="p-8 text-center text-mkhe-text/60">
                Không tìm thấy người dùng nào phù hợp.
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr
                key={user._id}
                className="border-b border-mkhe-border/20 hover:bg-mkhe-primary/5 transition-colors"
              >
                <td className="p-4">
                  <img
                    src={
                      user.avatar ||
                      `https://ui-avatars.com/api/?name=${user.name}&background=random`
                    }
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover border border-mkhe-border/50 shadow-sm"
                  />
                </td>
                <td className="p-4 font-medium">{user.name}</td>
                <td className="p-4 text-mkhe-text/80">{user.email}</td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold
                    ${
                      user.role === "Admin"
                        ? "bg-red-500/20 text-red-500"
                        : user.role === "Staff"
                          ? "bg-green-500/20 text-green-500"
                          : "bg-blue-500/20 text-blue-500"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="p-4 text-center space-x-4">
                  {/* Nút này sau này sẽ gọi Modal xem chi tiết */}
                  <button className="text-blue-500 hover:text-blue-400 font-medium hover:underline transition">
                    Xem
                  </button>
                  <button className="text-red-500 hover:text-red-400 font-medium hover:underline transition">
                    Khóa
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
