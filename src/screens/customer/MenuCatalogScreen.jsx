import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  addItem,
  decreaseItem,
  getTotalItems,
  getTotalPrice,
} from "../../utils/cartHelper";
import {
  scanCustomerMenu,
  createCustomerOrder,
  getCustomerOrders,
} from "../../services/customerApi";
import cartIcon from "../../assets/icons/cart.svg";
import menuIcon from "../../assets/icons/menu.svg";

const formatPrice = (price) =>
  Number(price || 0).toLocaleString("th-TH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

export default function MenuCatalogScreen() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [menu, setMenu] = useState([]);
  const [tableNumber, setTableNumber] = useState(null);
  const [category, setCategory] = useState("all");
  const [cart, setCart] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [isMenuLoading, setIsMenuLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ===================================
  // LOAD MENU + ORDER HISTORY
  // ===================================
  useEffect(() => {
    async function loadData() {
      try {
        setIsMenuLoading(true);
        setError("");

        const menuResult = await scanCustomerMenu(sessionId);
        setMenu(Array.isArray(menuResult.menus) ? menuResult.menus : []);
        setTableNumber(menuResult.table_number);

        const orderResult = await getCustomerOrders(sessionId);
        setOrderHistory(orderResult.orders || []);
      } catch (err) {
        console.error(err);
        setError("ไม่สามารถโหลดข้อมูลได้");
      } finally {
        setIsMenuLoading(false);
      }
    }

    if (sessionId) {
      loadData();
    }
  }, [sessionId]);

  // ประหยัดการคำนวณด้วย useMemo: หา Category เฉพาะตอนเมนูเปลี่ยน
  const categories = useMemo(() => {
    return [
      "all",
      ...new Set(menu.map((item) => item.category_name).filter(Boolean)),
    ];
  }, [menu]);

  // ประหยัดการคำนวณด้วย useMemo: กรองเมนูเฉพาะตอนเมนูหรือหมวดหมู่เปลี่ยน
  const filteredMenu = useMemo(() => {
    return category === "all"
      ? menu
      : menu.filter((item) => item.category_name === category);
  }, [menu, category]);

  const getItemQuantity = (id) =>
    cart.find((item) => item.id === id)?.qty || 0;

  // ===================================
  // SEND ORDER
  // ===================================
  const handleSubmitOrder = async () => {
    if (!cart.length) return;

    try {
      setIsSubmitting(true);

      const result = await createCustomerOrder({
        sessionId,
        items: cart,
        totalPrice: getTotalPrice(cart),
      });

      if (result?.success || result?.message) {
        alert("ส่งออเดอร์เข้าครัวแล้ว 🍽️");
        setCart([]);

        const orders = await getCustomerOrders(sessionId);
        setOrderHistory(orders || []);
      } else {
        alert("ส่งออเดอร์ไม่สำเร็จ");
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาด");
    } finally {
      setIsSubmitting(false);
    }
  };

  const cartItemCount = getTotalItems(cart);

  return (
    <main className="min-h-screen bg-black pb-32 text-zinc-100">
      {/* ================= HEADER ================= */}
      {/* HEADER */}
      <header className="sticky top-0 z-20 border-b border-yellow-500 bg-black/95 px-4 py-4 backdrop-blur">
        <div className="mx-auto max-w-3xl">

          {/* TOP ROW */}
          <div className="flex items-center justify-between">
            {/* LOGO */}
            <p className="text-xs font-bold tracking-[0.2em]">FOXY SHABU</p>

            {/* ORDER BUTTON */}
            <button
              onClick={() => navigate(`/orders/${sessionId}`)}
              className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-bold text-yellow-400 ring-1 ring-zinc-800"
            >
              <img
                src={menuIcon}
                alt="Menu"
                className="h-5 w-5 invert"
              />
              <span>
                รายการที่สั่ง
              </span>
            </button>
          </div>

          {/* TABLE INFO */}
          <div className="mt-2 text-sm text-yellow-400 ">
            โต๊ะ
            <span className="ml-1 font-bold text-white">
              {tableNumber ? tableNumber : "กำลังโหลด..."}
            </span>
          </div>

        </div>
      </header>

      {/* ================= MAIN CONTENT ================= */}
      <div className="mx-auto max-w-3xl px-4 py-5">
        {/* CATEGORY BAR */}
        <nav className="mb-5 flex gap-2 overflow-x-auto scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${category === cat
                ? "bg-white text-black"
                : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                }`}
            >
              {cat === "all" ? "ทั้งหมด" : cat}
            </button>
          ))}
        </nav>

        {/* LOADING & ERROR */}
        {isMenuLoading && (
          <p className="py-10 text-center text-sm text-zinc-400">
            กำลังโหลดเมนู...
          </p>
        )}

        {error && (
          <p className="py-10 text-center text-sm text-red-500">{error}</p>
        )}

        {/* MENU GRID */}
        {!isMenuLoading && !error && (
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {filteredMenu.map((item) => {
              const qty = getItemQuantity(item.id);

              return (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-3xl bg-zinc-900 flex flex-col justify-between"
                >
                  <div>
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-32 w-full bg-zinc-800 object-cover"
                    />
                    <div className="p-3">
                      <p className="font-bold line-clamp-2 min-h-[3rem]">
                        {item.name}
                      </p>
                      <p className="mt-1 font-black text-zinc-400">
                        ฿{formatPrice(item.price)}
                      </p>
                    </div>
                  </div>

                  {/* QUANTITY CONTROL */}
                  <div className="p-3 pt-0">
                    <div className="flex items-center justify-between rounded-xl bg-zinc-800 p-1">
                      <button
                        onClick={() => setCart((c) => decreaseItem(c, item.id))}
                        className="px-3 py-1 rounded-lg font-bold text-zinc-400 hover:text-white bg-white"
                      >
                        -
                      </button>
                      <span className="font-bold">{qty}</span>
                      <button
                        onClick={() => setCart((c) => addItem(c, item))}
                        className="px-3 py-1 rounded-lg font-bold text-zinc-400 hover:text-white bg-white"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>

      {/* ================= CART FOOTER ================= */}
      <footer className="fixed bottom-0 inset-x-0 border-t border-zinc-800 bg-black/95 p-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          {/* CART INFO */}
          <div className="flex items-center gap-3">
            <img src={cartIcon} alt="Cart" className="w-8 invert" />
            <div>
              <p className="text-sm text-zinc-400">{cartItemCount}รายการ</p>
              <p className="text-lg font-black text-yellow-400">
                ฿{formatPrice(getTotalPrice(cart))}
              </p>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            disabled={!cartItemCount || isSubmitting}
            onClick={handleSubmitOrder}
            className="rounded-2xl bg-yellow-500 px-6 py-3 font-black text-black transition-all hover:bg-yellow-400 disabled:bg-zinc-700 disabled:text-zinc-500"
          >
            {isSubmitting ? "กำลังส่ง..." : "ยืนยันออเดอร์"}
          </button>
        </div>
      </footer>
    </main>
  );
}