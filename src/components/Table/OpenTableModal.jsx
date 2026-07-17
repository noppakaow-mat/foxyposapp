import { useEffect, useState } from "react";
import { getPackages } from "../../services/packageService";

export default function OpenTableModal({
  table,
  loading,
  onClose,
  onSubmit
}) {
  const [packages, setPackages] = useState([]);
  const [packageId, setPackageId] = useState("");
  const [customerCount, setCustomerCount] = useState(1);

  useEffect(() => {
    loadPackages();
  }, []);

  async function loadPackages() {
    const res = await getPackages();
    setPackages(res.data || []);
  }

  function submit() {
    if (!packageId) {
      alert("กรุณาเลือก Package");
      return;
    }

    onSubmit({
      table_id: table.id,
      package_id: Number(packageId),
      customer_count: Number(customerCount)
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[420px] rounded-2xl bg-white p-6">
        <h2 className="text-xl font-bold">เปิดโต๊ะ {table.table_number}</h2>

        <label className="mt-5 block">จำนวนลูกค้า</label>
        <input
          type="number"
          min="1"
          value={customerCount}
          onChange={(e) => setCustomerCount(e.target.value)}
          className="w-full rounded-xl border p-3"
        />

        <label className="mt-5 block">Package</label>
        <select
          value={packageId}
          onChange={(e) => setPackageId(e.target.value)}
          className="w-full rounded-xl border p-3"
        >
          <option value="">เลือก Package</option>
          {packages.map((pkg) => (
            <option key={pkg.id} value={pkg.id}>
              {pkg.name} - {pkg.price_per_person} บาท
            </option>
          ))}
        </select>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl bg-gray-300 px-5 py-2"
          >
            ยกเลิก
          </button>

          <button
            disabled={loading}
            onClick={submit}
            className="rounded-xl bg-green-600 px-5 py-2 text-white"
          >
            {loading ? "กำลังเปิด..." : "เปิดโต๊ะ"}
          </button>
        </div>
      </div>
    </div>
  );
}