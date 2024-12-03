import { React, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Grid2 from '@mui/material/Grid2';
import axios from "axios";
import "../css/Login.css";

// Login Component
export const Login = ({ setCurrentUser }) => {
    const navigate = useNavigate();
    const [message, setMessage] = useState(""); // State สำหรับข้อความแสดงผล
    const [showPassword, setShowPassword] = useState(false);

    // const isValidEmail = (email) => {
    //     const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    //     return emailRegex.test(email);
    // };

    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const data = Object.fromEntries(formData.entries());

        // Reset message
        setMessage("");

        // Validate email and password
        if (!data.email || !data.password) {
            setMessage("Please enter username and password."); // Set validation message
            return; // Stop execution
        } //else if (!isValidEmail(data.email)) {
        //     setMessage("Please enter a valid email."); // Invalid email message
        //     return; // Stop execution
        // }

        // Proceed with the login request if no errors
        axios.post("http://localhost:56733/login", data)
            .then((response) => {
                alert("Login successful");
                setCurrentUser({
                    id: response.data.currentUser,
                    isAdmin: response.data.isAdmin,
                });

                if (response.data.isAdmin) {
                    navigate("/admin");
                } else {
                    navigate("/", { state: { stdID: response.data.stdID } });
                }
            })
            .catch(() => {
                setMessage("Invalid login credentials"); // Set error message
            });
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <Grid2 size={{ xs: 4, md: 2 }}>
            <div className="container">
                <div className="item">
                    <div className="contact">
                        {/* Add more content as needed */}
                    </div>

                    <div className="submit-form">
                        <form onSubmit={handleSubmit}>
                            <div>
                                <p className="cs">cs cmu</p>
                                <p className="hello">
                                    Hello,
                                    <br />
                                    Welcome!
                                </p>
                                <br />
                                <div className="inputt">
                                    <label>Username</label>
                                    <br />
                                    <input
                                        type="email"
                                        className="username"
                                        placeholder="example@cmu.ac.th"
                                        name="email"
                                    />
                                    <br />
                                    <label className="font-bold">Password</label>
                                    <br />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="password"
                                        placeholder="password"
                                        name="password"
                                    />
                                    <br />
                                    {/* <input type="checkbox" onClick={togglePasswordVisibility} /> Remember Me */}
                                    <br />
                                    <br />
                                    <center>
                                        {message && <p className="validation-message">{message}</p>}
                                        <button type="submit" className="submit">
                                            LOG IN
                                        </button>
                                    </center>
                                    <br />
                                    <br />
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Grid2>
    );
};

// Logout Component
export const Logout = ({ setCurrentUser }) => {
    const navigate = useNavigate();
    useEffect(() => {
        setCurrentUser({ id: 0, isAdmin: false });
        navigate("/login");
    }, [setCurrentUser, navigate]);

    return null;
};
