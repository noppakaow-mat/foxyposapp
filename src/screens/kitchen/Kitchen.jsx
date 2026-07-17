import { useEffect, useState } from "react";
import socket from "./kitchenSocket";
import { API_URL } from "../../services/Api";

const API = API_URL;

// =====================================
// TIMER
// =====================================
const getElapsed = (createdAt) => {
  const now = new Date();
  const created = new Date(createdAt);

  const diff = Math.max(0, Math.floor((now - created) / 1000));
  const min = Math.floor(diff / 60);
  const sec = diff % 60;

  return `${min}:${String(sec).padStart(2, "0")}`;
};

// =====================================
// DATE FORMAT
// =====================================
const formatDateTime = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleString("th-TH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function KitchenScreen() {
  const [tables, setTables] = useState([]);
  const [openOrders, setOpenOrders] = useState({});
  const [tick, setTick] = useState(Date.now());

  // =====================================
  // LOAD ORDERS API
  // =====================================
  const loadOrders = async () => {
    try {
      const res = await fetch(`${API}/orders/kitchen`);
      const data = await res.json();

      // ป้องกันการพังโดยใช้ fallback เผื่อไม่มีค่า orders ส่งกลับมา
      const formatted = (data || []).map((table) => ({
        ...table,
        orders: (table.orders || []).map((order) => ({
          ...order,
          order_no: order.order_number,
        })),
      }));

      setTables(formatted);
    } catch (err) {
      console.error("LOAD KITCHEN ERROR", err);
    }
  };

  // =====================================
  // INITIAL + SOCKET
  // =====================================
  useEffect(() => {
    loadOrders();

    socket.on("connect", () => {
      console.log("KITCHEN CONNECT:", socket.id);
      loadOrders();
    });

    socket.on("newOrder", (data) => {
      console.log("NEW ORDER", data);
      loadOrders();
    });

    socket.on("orderServed", (data) => {
      console.log("ORDER SERVED", data);
      loadOrders();
    });

    return () => {
      socket.off("connect");
      socket.off("newOrder");
      socket.off("orderServed");
    };
  }, []);

  // =====================================
  // TIMER UPDATE (Triggers re-render)
  // =====================================
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // =====================================
  // DROPDOWN
  // =====================================
  const toggleOrder = (id) => {
    setOpenOrders((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // =====================================
  // SERVE
  // =====================================
  const serveOrder = async (id) => {
    try {
      const res = await fetch(`${API}/orders/${id}/served`, {
        method: "PUT",
      });

      if (!res.ok) throw new Error();
      loadOrders();
    } catch (err) {
      console.error("SERVE ERROR", err);
    }
  };

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-zinc-100 sm:px-8">
      <section className="mx-auto max-w-6xl">

        {/* HEADER */}
        <header className="mb-10 text-center">
          <p className="text-xs font-bold tracking-[0.35em] text-zinc-500">
            FOXY SHABU
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">
            KITCHEN DISPLAY
          </h1>
          <p className="mt-3 text-sm text-zinc-400">
            ออเดอร์ที่กำลังรอทำ {tables.length} โต๊ะ
          </p>
        </header>

        {/* NO ORDERS */}
        {!tables.length ? (
          <section className="mx-auto max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-10 text-center">
            <p className="text-lg font-bold text-zinc-400">
              ยังไม่มีออเดอร์ใหม่
            </p>
          </section>
        ) : (
          /* TABLES GRID */
          <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {tables.map((table) => (
              <article
                key={table.table_session_id || table.table_id || table.table_number}
                className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 shadow-2xl"
              >
                <h2 className="text-2xl font-black">
                  โต๊ะ {table.table_number}
                </h2>

                {/* ORDERS LIST */}
                {(table.orders || []).map((order) => {
                  const status = String(order.status || "").toLowerCase();
                  const isPending = status === "pending";
                  const isServed = status === "served";
                  const isOpen = !!openOrders[order.id];

                  return (
                    <div
                      key={order.id}
                      className="mt-5 border-t border-zinc-800 pt-4"
                    >
                      {/* ACCORDION HEADER */}
                      <button
                        onClick={() => toggleOrder(order.id)}
                        className="flex w-full items-center justify-between transition-opacity hover:opacity-90 active:scale-[0.99]"
                      >
                        <div className="text-left">
                          <p className="text-sm font-black text-yellow-400">
                            ORDER {order.order_no}
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            {formatDateTime(order.created_at)}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span className="text-sm font-bold text-yellow-400">
                            {getElapsed(order.created_at)}
                          </span>

                          {isPending && (
                            <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-[11px] font-bold text-yellow-400">
                              กำลังทำ
                            </span>
                          )}

                          {isServed && (
                            <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-[11px] font-bold text-green-400">
                              ✔ เสิร์ฟแล้ว
                            </span>
                          )}

                          <span className="text-xs text-zinc-500 mt-1">
                            {isOpen ? "▲" : "▼"}
                          </span>
                        </div>
                      </button>

                      {/* ACCORDION CONTENT */}
                      {isOpen && (
                        <div className="mt-4">
                          <ul className="space-y-2 text-sm border-b border-zinc-850 pb-4">
                            {order.items?.map((item, index) => (
                              <li
                                key={index}
                                className="flex justify-between py-0.5"
                              >
                                <span className="text-zinc-300">
                                  {item.name}
                                </span>
                                <span className="font-bold text-yellow-400">
                                  x{item.qty}
                                </span>
                              </li>
                            ))}
                          </ul>

                          {/* ACTION BUTTON */}
                          {isPending && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                serveOrder(order.id);
                              }}
                              className="mt-4 w-full rounded-xl bg-green-600 py-2.5 text-sm font-bold text-white transition-all hover:bg-green-500 active:scale-[0.98]"
                            >
                              เสิร์ฟแล้ว
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </article>
            ))}
          </section>
        )}
      </section>
    </main>
  );
}