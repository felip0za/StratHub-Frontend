import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import R6HubLogo from "/src/assets/R6HubLogo.png";
import "./Navbar.css";

function Navbar() {
    const navigate = useNavigate();

    return (
        <header>
            <nav className="nav">
                <img src={R6HubLogo} alt="Logo do sistema" onClick={() => navigate("/")} className="nav-logo"/>
                <span onClick={() => navigate("/home")} className="nav-link">
                    Salas
                </span>
                <span onClick={() => navigate("/chatbox")} className="nav-link">
                    Sobre o site
                </span>
                <span onClick={() => navigate("/chatbox")} className="nav-link">
                    Seu time
                </span>
                <FaUserCircle 
                    className="profile-icon" 
                    onClick={() => navigate("/user")} 
                />
            </nav>
        </header>
    );
}

export default Navbar;
