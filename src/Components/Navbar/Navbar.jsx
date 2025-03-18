import { useNavigate } from "react-router-dom";
import R6HubLogo from "/src/assets/R6HubLogo.png";
import "./Navbar.css"

function Navbar() {
    const navigate = useNavigate();

    return (
        <header>
            <nav className="nav">
                {/* Logo */}
                <button onClick={() => navigate("/")} className="nav">
                    <img src={R6HubLogo} alt="Logo do sistema" />
                </button>

                {/* Contatar Button */}
                <button
                    onClick={() => navigate("/salas")}
                    className="nav"
                >
                    Salas
                </button>
            </nav>
        </header>
    );
}

export default Navbar;
