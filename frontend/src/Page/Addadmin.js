import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/Add.css";

export const Addadmin = () => {
  const [formData, setFormData] = useState({
    name_admin: "",
    email_admin: "",
    tel_admin: "",
    pw_admin: "",
    picture: null, // Image field for admin
  });

  const [loading, setLoading] = useState(false); // Loading state
  const [responseMessage, setResponseMessage] = useState(""); // Response message state
  const navigate = useNavigate();
  const [errorMessages, setErrorMessages] = useState({});
  // const [responseMessage, setResponseMessage] = useState('');

  const isValidEmail = (email) => {
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(email);
  };

  const AddNewAdmin = (event) => {
    event.preventDefault();
    setLoading(true); // Start loading
    setResponseMessage(""); // Clear any previous message
    setErrorMessages({}); // Reset error messages

    const errors = {};

    // Basic validation
    if (!formData.name_admin) {
      errors.name_admin = "Name is required!";
    }
    if (!formData.email_admin) {
      errors.email_admin = "Email is required!";
    } else if (!isValidEmail(formData.email_admin)) { // Validate Email
      errors.email_admin = "Email is not valid!";
    }
    if (!formData.tel_admin) {
      errors.tel_admin = "Tel is required!";
    } else if (formData.tel_admin.length !== 10) {
      errors.tel_admin = "Tel must be 10 digits!";
    } else if (!/^\d+$/.test(formData.tel_admin)) {
      errors.tel_admin = "Tel is not valid!";
    }
    if (!formData.pw_admin) {
      errors.pw_admin = "Password is required!";
    }

    const formDataToSend = new FormData();
    formDataToSend.append("name_admin", formData.name_admin);
    formDataToSend.append("email_admin", formData.email_admin);
    formDataToSend.append("tel_admin", formData.tel_admin);
    formDataToSend.append("pw_admin", formData.pw_admin);
    formDataToSend.append("picture", formData.picture);

    if (Object.keys(errors).length > 0) {
      setErrorMessages(errors);
      setLoading(false);
      return;
    }

    // Log the form data to console before sending
    console.log("Form Data being sent:", {
      name_admin: formData.name_admin,
      email_admin: formData.email_admin,
      tel_admin: formData.tel_admin,
      pw_admin: formData.pw_admin,
      picture: formData.picture ? formData.picture.name : null, // Log file name if present
    });

    // Send the form data
    // setLoading(true);
    // setResponseMessage('');


    // Check if there are any errors

    const newAdmin = { ...formData }; // Spread the form data

    axios
      .post("http://localhost:56733/addadmin", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        console.log(response.data);
        setResponseMessage("Admin added successfully!"); // Set success message
        setLoading(false); // Stop loading
        alert("Admin Already Added")
        navigate("/alladmin");
      })
      .catch((error) => {
        console.error("There was an error sending the data!", error);
        setLoading(false); // Stop loading
        setResponseMessage("There was an error adding the admin."); // Set error message
      });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setFormData({
        ...formData,
        picture: file,
      });
    } else {
      alert("Please upload a valid image file.");
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <>
      {/* {loading && (
        <div className="loading-screen">
          <div className="loader"></div>
        </div>
      )} */}
      <div className="containers">
        <br/>
        {!loading && (
          <form onSubmit={AddNewAdmin} noValidate>
            <div className="form-group">
              <label htmlFor="imageUpload">
                <img
                  src={formData.picture ? URL.createObjectURL(formData.picture) : "pic.png"}
                  className="uploaded-image"
                  alt="Display"
                  style={{ cursor: "pointer", width: "200px", height: "200px" }}
                />
              </label>
              <input
                className="input_select_text"
                id="imageUpload"
                type="file"
                accept="image/*"
                name="picture"
                onChange={handleFileChange}
                style={{ display: "none" }}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="name_admin">Name Admin</label><br />
              <input
                className={`input_select_text ${errorMessages.name_admin ? 'is-invalid' : ''}`}
                type="text"
                id="name_admin"
                name="name_admin"
                placeholder="Enter Fistname and Lastname"
                value={formData.name_admin}
                onChange={handleChange}
                required
              />
              {errorMessages.name_admin && <div className="error-message">{errorMessages.name_admin}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="email_admin">Email</label><br />
              <input
                className={`input_select_text ${errorMessages.email_admin ? 'is-invalid' : ''}`}
                type="email"
                id="email_admin"
                name="email_admin"
                placeholder="Enter Email"
                value={formData.email_admin}
                onChange={handleChange}
                required
              />
              {errorMessages.email_admin && <div className="error-message">{errorMessages.email_admin}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="tel_admin">Tel</label><br />
              <input
                className={`input_select_text ${errorMessages.tel_admin ? 'is-invalid' : ''}`}
                type="text"
                id="tel_admin"
                name="tel_admin"
                placeholder="Enter Telephone"
                value={formData.tel_admin}
                onChange={handleChange}
                maxLength={10}
                required
              />
              {errorMessages.tel_admin && <div className="error-message">{errorMessages.tel_admin}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="pw_admin">Password</label><br />
              <input
                className={`input_select_text ${errorMessages.pw_admin ? 'is-invalid' : ''}`}
                type="text"
                id="pw_admin"
                name="pw_admin"
                placeholder="Enter Password"
                value={formData.pw_admin}
                onChange={handleChange}
                required
              />
              {errorMessages.pw_admin && <div className="error-message">{errorMessages.pw_admin}</div>}
            </div>
            <button type="submit" className="button_add">เพิ่ม Admin</button>
            
          </form>
          
        )}

        {/* Display response message */}
        {responseMessage && (
          <div className="response-message">
            {responseMessage}
          </div>
        )}<br/>
      </div>
    </>
  );
};
