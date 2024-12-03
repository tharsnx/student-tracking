import React, { useState , useEffect} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/Add.css";

export const Addstudent = () => {
  const [formData, setFormData] = useState({
    name: '',
    stdID: '',
    tel: '',
    email: '',
    degree: '',
    advisor: '',
    email_advisor: '',
    picture: null,
  });

  const [customAdvisor, setCustomAdvisor] = useState('');
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [formValid, setFormValid] = useState(true);
  const [errorMessages, setErrorMessages] = useState({});
  const [advisors, setAdvisors] = useState([]); 

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch advisor data from the backend
    axios.get('http://localhost:56733/api/advisors')
      .then((response) => {
        setAdvisors(response.data);  // Set advisors state with the fetched data
      })
      .catch((error) => {
        console.error("There was an error fetching the advisors!", error);
      });
  }, []); 

  const isValidEmail = (email) => {
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(email);
  };

  const AddNewStudent = (event) => {
    event.preventDefault();
    setLoading(true);
    setResponseMessage('');
    setErrorMessages({}); // Reset error messages

    const errors = {};

    // Basic validation
    if (!formData.name) {
      errors.name = "Name is required!";
    }
    if (!formData.stdID) {
      errors.stdID = "Student ID is required!";
    }else if (formData.stdID.length !== 9) {
      errors.stdID = "Student ID must be 9 digits!";
    }else if (!/^\d+$/.test(formData.stdID)) {
      errors.stdID = "Student ID is no valid!";
    }
    if (!formData.tel) {
      errors.tel = "Tel is required!";
    }else if (formData.tel.length !== 10) {
      errors.tel = "Tel is no valid!";
    }else if (!/^\d+$/.test(formData.tel)) {
      errors.tel = "Tel is no valid!";
    }
    if (!formData.email) {
      errors.email = "Email is required!";
    } else if (!formData.email.endsWith("@cmu.ac.th")) { // Check if email ends
      errors.email = "Email is not valid!";
    } //else if (
    //   !formData.email.endsWith("@gmail.com") &&
    //   !formData.email.endsWith("@hotmail.com") &&
    //   !formData.email.endsWith("@cmu.ac.th")
    // ) {
    //   errors.email = "Email is not valid!";
    // }
    if (!formData.degree) {
      errors.degree = "Degree is required!";
    }
    if (!formData.advisor || (formData.advisor === "Other" && !customAdvisor)) {
      errors.advisor = "Advisor is required!";
    }
    if (!formData.email_advisor) {
      errors.email_advisor = "Email Advisor is required!";
    }else if (!isValidEmail(formData.email_advisor)) { // Validate Email Advisor
      errors.email_advisor = "Email is not valid!";
    }

    // if (!formData.picture) {
    //   errors.picture = "Picture is required!";
    // }

    // Check if there are any errors
    if (Object.keys(errors).length > 0) {
      setErrorMessages(errors);
      setLoading(false);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("stdID", formData.stdID);
    formDataToSend.append("tel", formData.tel);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("degree", formData.degree);
    const advisorToSend = formData.advisor === "Other" ? customAdvisor : formData.advisor;
    formDataToSend.append("advisor", advisorToSend);
    formDataToSend.append("email_advisor", formData.email_advisor);
    formDataToSend.append("picture", formData.picture);

    // Send the request
    axios
      .post("http://localhost:56733/addstudent", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        setResponseMessage(response.data.message);
        setLoading(false);
        navigate("/admin");
      })
      .catch((error) => {
        console.error("There was an error sending the data!", error);
        setLoading(false);
        setResponseMessage("There was an error adding the student.");
      });
  };

  const HandleFileChange = (event) => {
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

    if (name === 'advisor' && value !== 'Other') {
      setCustomAdvisor('');
    }
  };

  return (
    <>
      {loading && (
        <div className="loading-screen">
          <div className="loader"></div>
        </div>
      )}
      <div className="containers">
      <br />
        {!loading && (
          <form onSubmit={AddNewStudent} noValidate>
            <div className="form-group">
              <label htmlFor="imageUpload">
                <img
                  src={formData.picture ? URL.createObjectURL(formData.picture) : 'pic.png'}
                  className="uploaded-image"
                  alt="Display"
                  style={{ cursor: 'pointer', width: '200px', height: '200px' }}
                />
              </label>
              <input
                className="input_select_text"
                id="imageUpload"
                type="file"
                accept="image/*"
                name="picture"
                onChange={HandleFileChange}
                style={{ display: 'none' }}
                // required
              />
              {/* {errorMessages.picture && <div className="error-message">{errorMessages.picture}</div>} Display error message for picture */}
            </div>
            <div className="form-group">
              <label htmlFor="name" className="set-text">Name (ex.Peter Parker)</label><br />
              <input
                className={`input_select_text ${errorMessages.name ? 'is-invalid' : ''}`}
                type="text"
                id="name"
                name="name"
                placeholder="Enter Fistname and Lastname"
                value={formData.name}
                onChange={handleChange}
                required
              />
              {errorMessages.name && <div className="error-message">{errorMessages.name}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="stdID" className="set-text">Student ID (ex.6505106xx)</label><br />
              <input
                className={`input_select_text ${errorMessages.stdID ? 'is-invalid' : ''}`}
                type="text"
                id="stdID"
                name="stdID"
                placeholder="Enter Student ID (9 digits)"
                value={formData.stdID}
                onChange={handleChange}
                maxLength={9} // Limit input to 9 characters
                required
              />
              {errorMessages.stdID && <div className="error-message">{errorMessages.stdID}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="tel" className="set-text">Tel (ex.0999999999)</label><br />
              <input
                className={`input_select_text ${errorMessages.tel ? 'is-invalid' : ''}`}
                type="text"
                id="tel"
                name="tel"
                placeholder="Enter Phone Number (10 digits)"
                value={formData.tel}
                onChange={handleChange}
                maxLength={10}
                required
              />
              {errorMessages.tel && <div className="error-message">{errorMessages.tel}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="email" className="set-text">Email (ex.example@cmu.ac.th)</label><br />
              <input
                className={`input_select_text ${errorMessages.email ? 'is-invalid' : ''}`}
                type="email"
                id="email"
                name="email"
                placeholder="Enter CMU Email Account"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errorMessages.email && <div className="error-message">{errorMessages.email}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="degree" className="set-text">Degree</label><br />
              <select
                className={`input_select_text ${errorMessages.degree ? 'is-invalid' : ''}`}
                id="degree"
                name="degree"
                value={formData.degree}
                onChange={handleChange}
                required
              >
                <option value="">Select Degree</option>
                <option value="Master Degree Plan A1">Master Degree Plan A1</option>
                <option value="Master Degree Plan A2">Master Degree Plan A2</option>
                <option value="Master Degree Plan B">Master Degree Plan B</option>
                <option value="Ph.D Degree">Ph.D Degree</option>
                {/* <option value="PhD2.2">ปริญญาเอกหลักสูตรแบบ 2.2</option> */}
              </select>
              {errorMessages.degree && <div className="error-message">{errorMessages.degree}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="advisor" className="set-text">Teacher Advisor</label><br />
              <select
                className={`input_select_text ${errorMessages.advisor ? 'is-invalid' : ''}`}
                id="advisor"
                name="advisor"
                value={formData.advisor}
                onChange={handleChange}
                required
              >
                <option value="">Select Advisor</option>
                {advisors.map((advisor) => (
                  <option key={advisor.id} value={advisor.name}>
                    {advisor.name}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>
              {errorMessages.advisor && <div className="error-message">{errorMessages.advisor}</div>}
            </div>

            {/* Input for custom advisor name */}
            {formData.advisor === 'Other' && (
              <div className="form-group">
                <label htmlFor="customAdvisor" className="set-text">Advisor Name (ex.Michael Jordan)</label><br />
                <input
                  className={`input_select_text ${errorMessages.customAdvisor ? 'is-invalid' : ''}`}
                  type="text"
                  id="customAdvisor"
                  name="customAdvisor"
                  value={customAdvisor}
                  placeholder="Enter Advisor Name"
                  onChange={(e) => setCustomAdvisor(e.target.value)} // Update custom advisor input
                  required
                />
                {/* {errorMessages.customAdvisor && <div className="error-message">{errorMessages.customAdvisor}</div>} */}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email_advisor" className="set-text">Email Advisor (ex.example@gmail.com)</label><br />
              <input
                className={`input_select_text ${errorMessages.email_advisor ? 'is-invalid' : ''}`}
                type="email"
                id="email_advisor"
                name="email_advisor"
                placeholder="Enter Advisor Email"
                value={formData.email_advisor}
                onChange={handleChange}
                required
              />
              {errorMessages.email_advisor && <div className="error-message">{errorMessages.email_advisor}</div>}
            </div>
            <button type="submit" className="button_add">Add Student</button>
          </form>
        )}
        {/* Displaying the response message */}
        {responseMessage && (
          <div className="response-message">
            {responseMessage}
          </div>
        )}<br />
      </div>
    </>
  );
};
