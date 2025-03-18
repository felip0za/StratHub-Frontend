import { useNavigate } from "react-router-dom";
import R6HubLogo from "/src/assets/R6HubLogo.png";
import "./Navbar.css"

function Navbar() {
    const navigate = useNavigate();

    return (
        <header>
            <nav className="bg-gray-900 text-white py-4 px-6 flex items-center justify-between">
                {/* Logo */}
                <button onClick={() => navigate("/")} className="flex items-center">
                    <img src={R6HubLogo} alt="Logo do sistema" />
                </button>

                {/* Contatar Button */}
                <button
                    onClick={() => navigate("/salas")}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
                >
                    Salas
                </button>
            </nav>
        </header>
    );
}

export default Navbar;
