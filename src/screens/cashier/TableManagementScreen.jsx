import { useEffect, useState } from "react";
import { getTables, openTable, checkoutTable } from "./cashierService";
import CheckoutPanel from "../../components/Table/CheckoutPanel";
import personIcon from "../../assets/icons/person.svg";

export default function TableManagementScreen() {
  const [tables, setTables] = useState([]);
  const [selected, setSelected] = useState(null);
  const [checkoutTableData, setCheckoutTableData] = useState(null);
  const [packageId, setPackageId] = useState(1);
  const [customer, setCustomer] = useState(1);
  const [loading, setLoading] = useState(false);

  // ============================
  // LOAD TABLE
  // ============================
  useEffect(() => {
    loadTables();
  }, []);

  async function loadTables() {
    try {
      const data = await getTables();
      setTables(data);
    } catch (err) {
      console.error(err);
      alert("โหลดโต๊ะไม่สำเร็จ");
    }
  }

  // ============================
  // OPEN TABLE
  // ============================
  async function handleOpen() {
    if (!selected) return;
    try {
      setLoading(true);
      const result = await openTable({
        table_id: selected.id,
        package_id: Number(packageId),
        customer_count: Number(customer)
      });

      /* เปิด Receipt ใหม่ ส่ง session id ไปให้หน้า Receipt ดึง API เอง */
      window.open(
        `/receipt/${result.session.id}`,
        "_blank",
        "width=400,height=700"
      );

      setSelected(null);
      await loadTables();
    } catch (err) {
      console.error(err);
      alert(err.message || "เปิดโต๊ะไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }
// ============================
  // CHECKOUT
  // ============================
  async function handleFinishPayment() {
    try {
      await checkoutTable(checkoutTableData.id);
      setCheckoutTableData(null);
      await loadTables();
    } catch (err) {
      console.error(err);
      alert(err.message || "Checkout failed");
    }
  }  
  return (
    <div className="min-h-screen bg-black p-8">
      <h1 className="mb-8 text-3xl font-bold text-white text-center font-poppins">
        Table Overview
      </h1>

      {/* ====================== TABLE GRID ======================= */}
      <div className="grid grid-cols-5 gap-6">
        {tables.map(table => (
          <div
            key={table.id}
            onClick={() => {
              if (table.status === "available") {
                setSelected(table);
              } else {
                setCheckoutTableData(table);
              }
            }}
            className={`relative h-56 rounded-2xl p-6 text-white shadow-lg transition hover:scale-105 ${table.status === "available" ? "bg-green-800" : "bg-red-800"
              }`}
          >
            <div className="flex h-full flex-col items-center justify-center">
              <p className="text-sm font-medium">TABLE</p>

              <h2 className="mt-1 text-5xl font-bold leading-none">
                {table.table_number}
              </h2>

              <p className="mt-3">
                {table.status === "available" ? "ว่าง" : "ไม่ว่าง"}
              </p>
            </div>
            {table.status === "occupied" && (
              <div className="absolute bottom-5 left-6 right-6 flex items-center justify-center gap-2 rounded-full bg-white/20 py-2">
                <img src={personIcon} className="w-5 h-5 invert " alt="customer" />
                <span>{table.customer_count || 0} คน</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ====================== OPEN TABLE MODAL ======================= */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-96 rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-black" style={{ color: "#000000" }}>โต๊ะ {selected.table_number}</h2>

            <label className="mt-5 block text-gray-600">Package</label>
            <select
              value={packageId}
              onChange={e => setPackageId(e.target.value)}
              className="mt-2 w-full rounded-lg border p-3"
            >
              <option value="1">Buffet Standard 299</option>
              <option value="2">Buffet Premium 499</option>
              <option value="3">Buffet Platinum 699</option>
            </select>

            <label className="mt-5 block text-gray-600">จำนวนลูกค้า</label>
            <input
              type="number"
              min="1"
              value={customer}
              onChange={e => setCustomer(e.target.value)}
              className="mt-2 w-full rounded-lg border p-3"
            />

            <div className="mt-6 flex gap-3">
              <button onClick={() => setSelected(null)} className="flex-1 rounded-lg bg-gray-300 p-3">
                ยกเลิก
              </button>
              <button
                onClick={handleOpen}
                disabled={loading}
                className="flex-1 rounded-lg bg-green-600 p-3 text-white"
              >
                {loading ? "กำลังเปิด..." : "เปิดโต๊ะ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================== CHECKOUT PANEL ======================= */}
      <CheckoutPanel
        table={checkoutTableData}
        onClose={() => setCheckoutTableData(null)}
        onFinish={handleFinishPayment}
      />
    </div>
  );
}
