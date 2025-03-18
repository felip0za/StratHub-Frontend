import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar /> {/* Adiciona a Navbar aqui */}
      <div className="home-container">
        <h2 className="home-title">OLA</h2>
      </div>
    </>
  );
}

export default Home;
