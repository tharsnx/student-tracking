import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "../css/Add.css";

export const StudentFixinformation = (props) => {
  const location = useLocation();
  const stdID = location.state?.stdID || props.stdID || ""; 
  const [loading, setLoading] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [errorMessages, setErrorMessages] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    stdID: stdID,
    tel: '',
    email: '',
    degree: '',
    advisor: '',
    email_advisor: '',
    picture: null,
  });

  const navigate = useNavigate(); 

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const errors = {};

    // Name validation
    if (!formData.name) {
      errors.name = "Name is required!";
    }

    // Tel validation
    if (!formData.tel) {
      errors.tel = "Tel is required!";
    } else if (formData.tel.length !== 10 || !/^\d+$/.test(formData.tel)) {
      errors.tel = "Tel is not valid!";
    }

    // Advisor validation
    if (!formData.advisor) {
      errors.advisor = "Advisor is required!";
    }

    // Email advisor validation
    if (!formData.email_advisor) {
      errors.email_advisor = "Email Advisor is required!";
    } else if (!isValidEmail(formData.email_advisor)) {
      errors.email_advisor = "Email is not valid!";
    }

    setErrorMessages(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setLoadingSubmit(true);  
    setError(null);  

    // Perform validation
    if (!validateForm()) {
      setLoadingSubmit(false);
      return;
    }

    // Prepare data for submission
    const newStudentfix = {
      stdID: formData.stdID,
      name: formData.name,
      tel: formData.tel,
      email: formData.email,
      degree: formData.degree,
      advisor: formData.advisor,
      email_advisor: formData.email_advisor,
      picture: formData.picture ? formData.picture.split(',')[1] : null,
    };

    try {
      await axios.post("http://localhost:56733/studentfix", newStudentfix, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      await fetchData();  
      navigate("/admin");  
    } catch (error) {
      setError(error.response?.data?.error || "Error updating data. Please try again.");
      console.error("Update error:", error);
    } finally {
      setLoadingSubmit(false);  
    }
  };

  // Fetch student data from the API
  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:56733/currentstudent?stdID=${stdID}`);
      const studentData = response.data;

      setFormData(prevData => ({
        ...prevData,
        name: studentData.name || '',
        tel: studentData.tel || '',
        email: studentData.email || '',
        degree: studentData.plan || '',
        advisor: studentData.advisor || "",
        email_advisor: studentData.advisor_email || "",
        picture: studentData.picture ? `data:image/jpeg;base64,${studentData.picture}` : null,
      }));
    } catch (err) {
      setError("Error fetching data. Please try again.");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [stdID]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const HandleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prevData => ({
          ...prevData,
          picture: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please upload a valid image file.");
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  if (loading) {
    return <div className="loading-screen"><div className="loader"></div></div>;
  }

  return (
    <div className="containers">
      <br />
      {error && <div className="error-message">{error}</div>} 

      <form onSubmit={handleFormSubmit}>
        <div className="form-group">
          <label htmlFor="imageUpload">
            <img
              src={formData.picture ? formData.picture : 'pic.png'}
              className="uploaded-image"
              alt="Student"
              // style={{ cursor: 'pointer', width: '200px', height: '200px' }}
            />
          </label>
          <input
            id="imageUpload"
            type="file"
            accept="image/*"
            onChange={HandleFileChange}
            style={{ display: 'none' }}
          />
        </div>

        {/* Name Field */}
        <div className="form-group">
          <label htmlFor="name">Name</label><br />
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`input_select_text ${errorMessages.name ? 'is-invalid' : ''}`}
          />
          {errorMessages.name && <div className="error-message">{errorMessages.name}</div>}
        </div>

        {/* Student ID */}
        <div className="form-group">
          <label htmlFor="stdID">Student ID</label><br />
          <input
            type="text"
            id="stdID"
            name="stdID"
            value={formData.stdID}
            readOnly
            className="input_select_text"
          />
        </div>

        {/* Phone Number */}
        <div className="form-group">
          <label htmlFor="tel">Tel</label><br />
          <input
            type="text"
            id="tel"
            name="tel"
            value={formData.tel}
            onChange={handleChange}
            maxLength={10}
            className={`input_select_text ${errorMessages.tel ? 'is-invalid' : ''}`}
          />
          {errorMessages.tel && <div className="error-message">{errorMessages.tel}</div>}
        </div>

        {/* Email Field */}
        <div className="form-group">
          <label htmlFor="email">Email</label><br />
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            readOnly
            className="input_select_text"
          />
        </div>

        {/* Degree Field */}
        <div className="form-group">
          <label htmlFor="degree">Degree</label><br />
          <input
            id="degree"
            name="degree"
            value={formData.degree}
            readOnly
            className="input_select_text"
          />
        </div>

        {/* Advisor Field */}
        <div className="form-group">
          <label htmlFor="advisor">Teacher Advisor</label><br />
          <input
            type="text"
            id="advisor"
            name="advisor"
            value={formData.advisor}
            onChange={handleChange}
            className={`input_select_text ${errorMessages.advisor ? 'is-invalid' : ''}`}
          />
          {errorMessages.advisor && <div className="error-message">{errorMessages.advisor}</div>}
        </div>

        {/* Advisor Email */}
        <div className="form-group">
          <label htmlFor="email_advisor">Email Advisor</label><br />
          <input
            type="email"
            id="email_advisor"
            name="email_advisor"
            value={formData.email_advisor}
            onChange={handleChange}
            className={`input_select_text ${errorMessages.email_advisor ? 'is-invalid' : ''}`}
          />
          {errorMessages.email_advisor && <div className="error-message">{errorMessages.email_advisor}</div>}
        </div>

        {/* Submit Button */}
        <button type="submit" className="button_add" disabled={loadingSubmit}>
          {loadingSubmit ? "Submitting..." : "Update"}
        </button>
      </form>
      <br />
    </div>
  );
};
