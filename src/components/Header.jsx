import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="flex h-16 items-center justify-between bg-black px-6 text-white border-b-2 border-yellow-400">
      {/* LEFT */}
      <div>
        <h1 className="text-xs font-bold font-poppins">FOXY POS</h1>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm">Cashier</p>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-xl bg-yellow-400 px-4 py-2 text-sm hover:bg-yellow-500 text-black"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
