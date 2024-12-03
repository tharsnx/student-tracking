import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { React, useState, useEffect } from "react";
import { Home } from "./Page/home";
import { Navbar } from "./Page/Navbar"; // Navbar import
import { Login, Logout } from "./Page/Login";
import { Addadmin } from "./Page/Addadmin";
import { Addstudent } from "./Page/Addstudent";
import { StudentFixinformation } from "./Page/StudentFix";
import { TestSend } from "./Page/Test_send_email";
import { Admin } from "./Page/Admin";
import { Data } from "./Page/Data";
import { ProgressBar } from "./Page/progressbar";
import { Alladmin } from "./Page/Alladmin";
import { AddCourse } from "./Page/Addcourse"; // Fixed import
import { Alumni } from "./Page/Alumni";

function App() {
  const navigate = useNavigate();
  const location = useLocation(); // Get current path

  // Check for existing user in local storage or default
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem("currentUser");
    return savedUser ? JSON.parse(savedUser) : { id: 0, isAdmin: false };
  });

  // Redirect to login if no user is logged in and not on login page
  useEffect(() => {
    if (currentUser.id === 0 && location.pathname !== "/login") {
      navigate("/login");
    }
  }, [currentUser, location.pathname, navigate]);

  // Update local storage when currentUser changes
  useEffect(() => {
    if (currentUser.id !== 0) {
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("currentUser");
    }
  }, [currentUser]);

  return (
    <>
      {/* Navbar is hidden on the login page */}
      {location.pathname !== "/login" && (
        <Navbar user={currentUser} setCurrentUser={setCurrentUser} />
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/addstudent" element={<Addstudent />} />
        <Route path="/addadmin" element={<Addadmin />} />
        <Route path="/studentfix" element={<StudentFixinformation stdID={null} />} />
        <Route path="/test" element={<TestSend />} />
        <Route path="/login" element={<Login setCurrentUser={setCurrentUser} />} />
        <Route path="/logout" element={<Logout setCurrentUser={setCurrentUser} />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/data" element={<Data />} />
        <Route path="/progressbar" element={<ProgressBar />} />
        <Route path="/alladmin" element={<Alladmin />} />
        <Route path="/addcourse" element={<AddCourse />} /> {/* Fixed route */}
        <Route path="/alumni" element={<Alumni />} />
      </Routes>
    </>
  );
}

export default App;
