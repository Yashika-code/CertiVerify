import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

const Navbar = ({ dashboard, post, user }) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");
  const [role, setRole] = useState("User");

  useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) return;

  authAPI.getCurrentUser()
    .then(res => {
      const u = res.data.user;
      if (u?.name) {
        setUserName(u.name);
        setRole(u.role);
        localStorage.setItem("userName", u.name);
        localStorage.setItem("userRole", u.role);
      }
    })
    .catch(() => {});
}, []);


  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="border-b bg-white border-gray-200 p-4 flex justify-between items-center">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">{dashboard}</h1>
      </div>

      <div className="text-right">
        <p className="text-gray-950 font-semibold text-[18px]">{userName}</p>
        <p className="text-gray-700">{role}</p>
        <button
          onClick={logout}
          className="text-red-500 text-sm mt-1 hover:underline"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
