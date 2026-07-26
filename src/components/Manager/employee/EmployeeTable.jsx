import { useMemo, useState } from "react";
import {
  Search,
  UserPlus,
  Pencil,
  Trash2,
} from "lucide-react";

import RoleBadge from "./RoleBadge";

export default function EmployeeTable({
  users = [],
  onEditRole,
  onDelete,
  onAddEmployee,
}) {
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.username
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        user.role
          .toLowerCase()
          .includes(search.toLowerCase())
    );
  }, [users, search]);

  return (
    <section className="rounded-2xl bg-white shadow-lg border border-gray-100 overflow-hidden">

      {/* Header */}
      <div className="flex flex-col gap-4 p-6 border-b lg:flex-row lg:items-center lg:justify-between">

        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Employee Management
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            จัดการผู้ใช้งานภายในระบบ FoxyPOS
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">

          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-300 pl-10 pr-4 py-2 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-300 outline-none"
            />
          </div>

          <button
            onClick={onAddEmployee}
            className="flex items-center justify-center gap-2 rounded-xl bg-yellow-500 px-4 py-2 font-semibold text-white transition hover:bg-yellow-600"
          >
            <UserPlus size={18} />
            Add Employee
          </button>

        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">

        <table className="min-w-full">

          <thead className="bg-gray-50">

            <tr className="text-sm uppercase tracking-wide text-gray-500">

              <th className="px-6 py-4 text-center w-16">
                #
              </th>

              <th className="px-6 py-4 text-left">
                Employee
              </th>

              <th className="px-6 py-4 text-center">
                Role
              </th>

              <th className="px-6 py-4 text-center">
                Created
              </th>

              <th className="px-6 py-4 text-right">
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredUsers.length > 0 ? (

              filteredUsers.map((user, index) => (

                <tr
                  key={user.id}
                  className="border-t hover:bg-yellow-50 transition"
                >

                  <td className="px-6 py-5 text-center font-semibold">
                    {index + 1}
                  </td>

                  <td className="px-6 py-5">

                    <div className="flex items-center gap-3">

                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-yellow-400 text-lg font-bold text-white">
                        {user.username.charAt(0).toUpperCase()}
                      </div>

                      <div>

                        <p className="font-semibold text-gray-800">
                          {user.username}
                        </p>

                        <p className="text-xs text-gray-500">
                          Employee ID : {user.id}
                        </p>

                      </div>

                    </div>

                  </td>

                  <td className="px-6 py-5 text-center">

                    <RoleBadge role={user.role} />

                  </td>

                  <td className="px-6 py-5 text-center text-gray-500">

                    {user.created_at
                      ? new Date(
                          user.created_at
                        ).toLocaleDateString()
                      : "-"}

                  </td>

                  <td className="px-6 py-5">

                    <div className="flex justify-end gap-2">

                      <button
                        onClick={() => onEditRole(user)}
                        className="rounded-lg bg-blue-100 p-2 text-blue-600 transition hover:bg-blue-600 hover:text-white"
                        title="Edit Role"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        onClick={() => onDelete(user.id)}
                        className="rounded-lg bg-red-100 p-2 text-red-600 transition hover:bg-red-600 hover:text-white"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>

                    </div>

                  </td>

                </tr>

              ))

            ) : (

              <tr>

                <td
                  colSpan={5}
                  className="py-12 text-center text-gray-400"
                >
                  ไม่พบข้อมูลพนักงาน
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>
    </section>
  );
}