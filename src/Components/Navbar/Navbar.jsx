import { useNavigate } from "react-router-dom";
import R6HubLogo from "/src/assets/R6HubLogo.png";
import "./Navbar.css";

function Navbar() {
    const navigate = useNavigate();

    return (
        <header>
            <nav className="nav">
                <img src={R6HubLogo} alt="Logo do sistema" onClick={() => navigate("/")}/>
                <span onClick={() => navigate("/salas")} className="nav-link">
                    Salas
                </span>
            </nav>
        </header>
    );
}

export default Navbar;
