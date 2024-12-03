import { useLocation, useNavigate } from "react-router-dom";
import { React, useEffect, useState } from "react";
import "../css/home.css";
import axios from "axios";
import { ProgressBar } from "../Page/progressbar.js";
import DonutChart from "../Page/DonutChart.js";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import SchoolIcon from '@mui/icons-material/School';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import Button from "@mui/material/Button";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

export const Home = (props) => {
  const location = useLocation();
  const stdID =
    location.state?.stdID || props.stdID || localStorage.getItem("stdID") || "";

  const currentUser = props.currentUser ||
    JSON.parse(localStorage.getItem("currentUser")) || {
    id: 0,
    isAdmin: false,
  };
  const navigate = useNavigate();
  const [show, setShow] = useState("progress");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [files, setFiles] = useState([]); // State to store the uploaded files
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [courses, setCourses] = useState([]);
  const [credit, setCredit] = useState(0);
  const [meeting, setMeeting] = useState([]);
  const [topic, setTopic] = useState([]);
  const [publishToDelete, setPublishToDelete] = useState(null);  // เก็บ ID ของไฟล์ที่เลือกจะลบ
  const [open, setOpen] = useState(false);  // เก็บสถานะเปิด-ปิดของ Dialog

  const [topicToDelete, setTopicToDelete] = useState(null);  // เก็บ ID ของไฟล์ที่จะลบ
  const [openT, setOpenT] = useState(false);  // สถานะเปิด-ปิดของ Dialog

  const [formData, setFormData] = useState({
    name: "",
    stdID: "",
    tel: "",
    email: "",
    degree: "",
    advisor: "",
    email_advisor: "",
    // image: null, // For uploading new image
    picture: null, // Displaying the current image fetched from API
  });

  const [plan, setFormplan] = useState({
    stdID: null,
    testEng: null,
    nPublish: null,
    finishedExam: null,
    comprehensiveExam: null,
    QualifyingExam: null,
    credit: 0,
    Complete_Course: false,
    defense_exam: false,
    publish_research: false,
    topic: false

  });

  const [selectedCourses, setSelectedCourses] = useState("");
  const [courseArray, setCourseArray] = useState([]);

  const handleClickOpen = (publish) => {
    setPublishToDelete(publish);  // เก็บ publish ที่จะถูกลบ
    setOpen(true);  // เปิด Dialog
  };

  const handleClickOpenT = (topic) => {
    setTopicToDelete(topic);  // เก็บ topic ที่จะลบ
    setOpenT(true);  // เปิด Dialog
  };

  const handleInputChange = (event) => {
    const inputValue = event.target.value;
    setSelectedCourses(inputValue);

    // Split the input string by commas, filter out empty strings, and set the resulting array
    const courses = inputValue
      .split(",")
      .filter((course) => course.trim() !== "");
    setCourseArray(courses);
    //(courses); // Log the newly created array
  };

  useEffect(() => {
    // Save stdID to localStorage if not already saved
    if (stdID && !localStorage.getItem("stdID")) {
      localStorage.setItem("stdID", stdID);
    }

    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:56733/currentstudent?stdID=${stdID}`
        );
        const studentData = response.data;
        //(studentData);

        const picture = studentData.picture
          ? `data:image/jpeg;base64,${studentData.picture}`
          : null;

        // Update formData with student data and the picture (if available)
        setFormData((prevData) => ({
          ...prevData,
          name: studentData.name || "",
          stdID: stdID,
          tel: studentData.tel || "",
          email: studentData.email || "",
          degree: studentData.plan || "",
          advisor: studentData.advisor || "",
          email_advisor: studentData.advisor_email || "",
          image: null,
          picture: picture,
        }));

        //(formData);

        setLoading(false);
      } catch (err) {
        setError("Error fetching data");
        setLoading(false);
        console.error(err);
      }
    };

    fetchData();
    fetchUploadedFiles();
    fetchUploadedTopic();
    fetchPlan();
    fetchCourses();
  }, [stdID]);

  const addMeeting = async (e) => {
    e.preventDefault(); // Prevent form from reloading the page

    const formData = new FormData(e.target); // Get form data

    const date = formData.get("date-meeting");
    const stdID = formData.get("stdID");

    try {
      const response = await axios.post("http://localhost:56733/addmeeting", {
        date,
        stdID,
      });

      if (response.status === 200) {
        // alert("Meeting added successfully");
      } else {
        alert("Error adding meeting");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while adding the meeting");
    }
  };

  const fetchUploadedFiles = async () => {
    try {
      const response = await axios.get(
        `http://localhost:56733/uploads?stdID=${stdID}`
      );
      setFiles(response.data.files);
    } catch (err) {
      setError("Error fetching files");
    }
  };

  const fetchUploadedTopic = async () => {
    try {
      const response = await axios.get(
        `http://localhost:56733/loadstopic?stdID=${stdID}`
      );
      setTopic(response.data.files);
    } catch (err) {
      setError("Error fetching files");
    }
  };

  const fetchPlan = async () => {
    // console.log("sssssss");
    
    try {
      // console.log("dddddddd");
      const response = await axios.get(
        `http://localhost:56733/currentstudentplan?stdID=${stdID}`
      );
      const studentData = response.data;
      // //(studentData);
      
      
      // console.log(studentData);
      

      const convertFile = (fileData) => {
        if (fileData && fileData.file) {
          return {
            dataUrl: `data:${fileData.fileType};base64,${fileData.file}`,
            isImage: fileData.fileType
              ? fileData.fileType.startsWith("image")
              : false,
            isPDF: fileData.fileType === "application/pdf",
          };
        }
        return null;
      };
      console.log(studentData.Defense_Examination);
      
      // Here you can spread the previous state and update the specific fields
      setFormplan({
        stdID: studentData.stdID || null,
        testEng: convertFile(studentData.English_Test) || null,
        comprehensiveExam: convertFile(studentData.Comprehensive_Examination) || null,
        QualifyingExam: convertFile(studentData.Qualifying_Examination) || null,
        nPublish: studentData.nPublish || 0,
        Complete_Course: studentData.Complete_all_course || false,
        defense_exam: studentData.Defense_Examination || false,
        publish_research: studentData.Published_Research || false,
        topic: studentData.Propose_a_Research_Topic || false
      });
      console.log(plan);
      
      // setLoading(false);
      setLoading(false);
    } catch (err) {
      setError("Error fetching data");
      setLoading(false);
      console.error(err);
      setError("Error fetching data");
      setLoading(false);
      console.error(err);
    }
  };

  const handleUpdate = () => {
    setShow((prevShow) => (prevShow === "progress" ? "update" : "progress"));
    // fetchData();
    // fetchUploadedFiles();
    // fetchPlan();
    fetchCourses();
    // fetchData();
    // fetchUploadedFiles();
    // fetchUploadedTopic();
    
    
    fetchPlan();
    console.log(plan);
  };

  const handleClose = () => {
    setOpen(false);  // ปิด Dialog
  };

  const handleCloseT = () => {
    setOpenT(false);  // ปิด Dialog
  };

  const uptoAlumni = async () => {
    try {
      const response = await axios.post(
        `http://localhost:56733/uptoalumni?stdID=${stdID}`
      );
      console.log("Response:", response.data);
      navigate("/admin");
    } catch (error) {
      console.error("Error updating student to alumni:", error);
    }
  };

  const uploadFile = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    console.log(data);

    try {
      const response = await axios.post(
        "http://localhost:56733/uploadfile",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      // alert("Upload successful");
      event.target.reset();
      fetchUploadedFiles(); // Refresh file list after uploading
      fetchUploadedTopic();
    } catch (error) {
      setError("File upload failed");
      console.error("Error uploading the file:", error);
    }
  };

  const uploadTopic = async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior
    const formData = new FormData(event.currentTarget); // Create FormData from form elements

    try {
      const response = await axios.post(
        "http://localhost:56733/uploadtopic",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" }, // Set headers for file upload
        }
      );
      // alert(response.data.message);
      event.target.reset(); // Reset the form after successful upload
      fetchUploadedFiles(); // Refresh file list after uploading
      fetchUploadedTopic();
    } catch (error) {
      console.error("Error uploading the file:", error);
      alert(
        "File upload failed: " +
        (error.response?.data?.message || "Unknown error")
      ); // Alert the user in case of error
    }
  };

  const editProgress = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget); // Create a FormData object
    //(courseArray);
    // Append Complete_Course from the plan object
    formData.append("Complete_Course", plan.Complete_Course); // Append the Complete_Course value
    formData.append("defense_exam", plan.defense_exam);
    formData.append("Regits_Course", courseArray);
    formData.append("Published_Research",plan.publish_research);
    formData.append("Topic",plan.topic)
    // Log the form data for debugging
    const data = Object.fromEntries(formData.entries());
    //("Form Data:", data);
    console.log(data);
    
    try {
      const response = await axios.post(
        "http://localhost:56733/editprogress",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" }, // Ensure it's multipart for file upload
        }
      );
      alert("Progress updated successfully")
      fetchPlan(); // Refresh the study plan after the update
      fetchCourses();
    } catch (error) {
      setError("Progress update failed");
      // console.error("Error updating progress:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get(
        `http://localhost:56733/getcourses?stdID=${stdID}`
      );
      setCourses(response.data.courses);
      setCredit(response.data.credit);
      setMeeting(response.data.meeting);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const togglePopup = () => {
    setShowPopup(!showPopup);
    if (!showPopup) {
      fetchCourses();
    }
  };

  const handleDeleteP = async (ID) => {
    try {
      await axios.delete(`http://localhost:56733/deletepublish/${ID}`);
      setOpen(false);  // ปิด Dialog หลังจากลบเสร็จ
      fetchUploadedFiles();  // โหลดไฟล์ใหม่หลังจากลบเสร็จ
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("An error occurred while trying to delete the file.");
    }
  };

  const handleDeleteT = async (ID) => {
    try {
      await axios.delete(`http://localhost:56733/deletetopic/${ID}`);  // ลบไฟล์ที่เลือก
      setOpenT(false);  // ปิด Dialog หลังจากลบเสร็จ
      fetchUploadedTopic();  // โหลดไฟล์ใหม่หลังจากลบเสร็จ
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("An error occurred while trying to delete the file.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  //(progressPercentage);

  return (
    <div className="home-container">
      {/* Display helloworld for mobile screens */}
      <div className="hidden-mobile">
        <h4>PhD Student</h4>
        <div className="sidebar-mb">
          <div className="rec">
            <div className="inside">
              {formData.picture ? (
                <img className="picture" src={formData.picture} alt="User" />
              ) : (
                <img className="picture" src="pic.png" alt="User" />
              )}
              <p>{formData.name}</p>
              <p>Student ID {formData.stdID}</p>
              <hr />
              <p>{formData.degree}</p>
            </div>
          </div>
          <br />
          <div className="advisor">
            Advisor: {formData.advisor || "Not available"}
          </div>
          <div className="email">
            Email of Advisor: {formData.email_advisor || "Not available"}
          </div>

          {currentUser.isAdmin && show === "progress" && (
            <div>
              <button onClick={handleUpdate}>Update Progress</button>
            </div>
          )}
        </div>
      </div>

      <div className="sidebar">
        <h4>PhD Student</h4>
        <div className="rec">
          <div className="inside">
            {formData.picture ? (
              <img className="picture" src={formData.picture} alt="User" />
            ) : (
              <img className="picture" src="pic.png" alt="User" />
            )}
            <p>{formData.name}</p>
            <p>Student ID {formData.stdID}</p>
            <hr />
            <p>{formData.degree}</p>
          </div>
        </div>
        <br />
        <div className="advisor">
          Advisor: {formData.advisor || "Not available"}
        </div>
        <div className="email">
          Email of Advisor: {formData.email_advisor || "Not available"}
        </div>
        <br />

        {currentUser.isAdmin && show === "progress" && (
          <div>
            <button onClick={handleUpdate} className="editpro">
              Edit
            </button>
          </div>
        )}
      </div>

      {show === "progress" ? (
        <div className="progress-bar-container">
          <div className="items-progress">
            <div className="progressbar">
              <ProgressBar
                stdID={stdID}
                onProgressUpdate={setProgressPercentage}
              />
              {/* {currentUser.isAdmin &&
                show === "progress" &&
                progressPercentage === 100 && (
                  <div>
                    <button onClick={uptoAlumni}>Graduated</button>
                  </div>
                )} */}
            </div>
            <div className="DonutChart">
              <DonutChart progress={progressPercentage} />
              <div className="course"></div>
              <br />
              <br />
              <br />
              <div className="box">
                <br />
                <p>Credits Received {credit}</p>
                <button onClick={togglePopup} className="popup-button">
                  Credits
                </button><br /><br />
              </div>
              <br />
              <div className="box2">
                <p>Conference</p><br />
                {meeting.length > 0 ? (
                  <ul>
                    {meeting.map((meetDate, index) => (
                      <li key={index}>Date: {meetDate}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No meetings scheduled for this student.</p>
                )}
              </div>
              {showPopup && (
                <div className="popup-modal">
                  <div className="popup-content">
                    <h2>Courses</h2>
                    {/* <h2>{credit}</h2> */}
                    {courses.length > 0 ? (
                      <ul>
                        {courses.map((course, index) => (
                          <li
                            key={index}
                            className={
                              course.registered ? "registered" : "notregis"
                            }
                          >
                            {course.courseID} - {course.planName} (
                            {course.credit} credits{ })
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No courses found for this student.</p>
                    )}
                    <button onClick={togglePopup} className="close-popup">
                      Close
                    </button>
                  </div>
                </div>
              )}
              {currentUser.isAdmin && show === "progress" && progressPercentage === 100 && (
                <div>
                  <button onClick={uptoAlumni} className="grad-button">
                    <SchoolIcon style={{ fontSize: 20, color: 'white', marginRight: '8px' }} /> {/* Adjust size and color */}
                    Graduated
                  </button>
                </div>

              )}

            </div>

          </div>

        </div>

      ) : (
        <div className="box-edit">
          <div className="editprogress-container">
            {/* ส่วนฟอร์มการแก้ไข Progress */}
            <div className="editprogress">
              <form onSubmit={editProgress} encType="multipart/form-data">
                <input type="hidden" name="stdID" value={stdID} />
                {/* Test English Section */}
                <div>
                  <p>Test English</p>
                  {plan.testEng  === null ? (
                    <>
                      <input
                        type="file"
                        id="testEng"
                        name="testEng"
                        className="editprogress_input"
                      />
                      <label htmlFor="testEng" className="editprogress_label">
                        Unsuccess
                      </label>
                    </>
                  ) : (
                    <div>
                      <label
                        onClick={() => {
                          setFormplan({ ...plan, testEng: null });
                        }}
                        className="editprogress_label_pass"
                      >
                        Success
                      </label>
                      <div className="file">
                        <InsertDriveFileIcon style={{ marginRight: "8px" }} />
                        <a
                          href={`http://localhost:56733/downloadplan/${stdID}/testEng`}
                          download
                        >
                          TestEnglish_{stdID}
                        </a>
                        {/* <DeleteForeverIcon style={{ color: 'red', cursor: 'pointer' }} /> */}
                      </div>
                    </div>
                  )}
                </div>

                {/* Comprehensive Exam Section */}
                <div>
                  <p>Comprehensive Exam</p>
                  {plan.comprehensiveExam === null ? (
                    <>
                      <input
                        type="file"
                        id="comprehensiveExam"
                        name="comprehensiveExam"
                        className="editprogress_input"
                      />
                      <label
                        htmlFor="comprehensiveExam"
                        className="editprogress_label"
                      >
                        Unsuccess
                      </label>
                    </>
                  ) : (
                    <div>
                      <label
                        onClick={() =>
                          setFormplan({ ...plan, comprehensiveExam: null })
                        }
                        className="editprogress_label_pass"
                      >
                        Success
                      </label>
                      <div className="file">
                        <InsertDriveFileIcon style={{ marginRight: "8px" }} />
                        {/* <p>Uploaded File:</p> */}
                        <a
                          href={`http://localhost:56733/downloadplan/${stdID}/comprehension`}
                          download
                        >
                          ComprehensiveExam_{stdID}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Qualifying Exam Section */}
                <div>
                  <p>Qualifying Exam</p>
                  {plan.QualifyingExam === null ? (
                    <>
                      <input
                        type="file"
                        id="QualifyingExam"
                        name="QualifyingExam"
                        className="editprogress_input"
                      />
                      <label
                        htmlFor="QualifyingExam"
                        className="editprogress_label"
                      >
                        Unsuccess
                      </label>
                    </>
                  ) : (
                    <div>
                      <label
                        onClick={() =>
                          setFormplan({ ...plan, QualifyingExam: null })
                        }
                        className="editprogress_label_pass"
                      >
                        Success
                      </label>
                      <div className="file">
                        {/* <InsertDriveFileIcon style={{ marginRight: "8px" }} /> */}
                        {/* <p>Uploaded File:</p> */}
                        <a
                          href={`http://localhost:56733/downloadplan/${stdID}/quality`}
                          download
                        >
                          QualifyingExam_{stdID}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Complete all required courses */}
                <div>
                  <p>Complete Course</p>
                  {plan.Complete_Course === false ? (
                    <>
                      <label
                        htmlFor="Complete_Course"
                        className="editprogress_label"
                        onClick={() =>
                          setFormplan({ ...plan, Complete_Course: true })
                        }
                      >
                        Unsuccess
                      </label>
                    </>
                  ) : (
                    <div>
                      <label
                        onClick={() =>
                          setFormplan({ ...plan, Complete_Course: false })
                        }
                        className="editprogress_label_pass"
                      >
                        Success
                      </label>
                    </div>
                  )}
                </div>
                {/* <br />
                <br /> */}
                <div>
                  <p>Defense Examination</p>
                  {plan.defense_exam === false ? (
                    <>
                      <label
                        htmlFor="defense_exam"
                        className="editprogress_label"
                        onClick={() =>
                          setFormplan({ ...plan, defense_exam: true })
                        }
                      >
                        Unsuccess
                      </label>
                    </>
                  ) : (
                    <div>
                      <label
                        onClick={() =>
                          setFormplan({ ...plan, defense_exam: false })
                        }
                        className="editprogress_label_pass"
                      >
                        Success
                      </label>
                    </div>
                  )}
                </div>
                <br/>

                {/* Course Selection */}
                <label>Course ID
                
                  <br/> (ex.204712)<br/>(ex.204712,204713)</label>
                
                <br />
                {/* <br /> */}
                <input
                  className="course-id"
                  type="text"
                  onChange={handleInputChange}
                  placeholder="Enter Course IDs"
                />
                <button className="button-save1" type="submit">
                  Save Progress
                </button>
              </form>
              <button onClick={togglePopup} className="popup-button">
                Credits
              </button>
              {showPopup && (
                <div className="popup-modal">
                  <div className="popup-content">
                    <h2>Courses</h2>
                    {/* <h2>{credit}</h2> */}
                    {courses.length > 0 ? (
                      <ul>
                        {courses.map((course, index) => (
                          <li key={index} className={course.registered ? ("registered") : ("notregis")}>
                            {course.courseID} - {course.planName} (
                            {course.credit} credits{ })
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No courses found for this student.</p>
                    )}
                    <button onClick={togglePopup} className="close-popup">
                      Close
                    </button>
                  </div>
                </div>
              )}
              
            </div>

            {/* ส่วนการอัปโหลดไฟล์ */}
            <div className="upload-section">
              <p>Published Research</p>
              <div className="box-research">
                
                <form
                  onSubmit={uploadFile}
                  encType="multipart/form-data"
                  className="choosefile"
                >
                  {plan.publish_research === false ? (
                    <>
                      <label
                        htmlFor="defense_exam"
                        className="editprogress_label1"
                        onClick={() =>
                          setFormplan({ ...plan, publish_research: true })
                        }
                      >
                        Unsuccess
                      </label>
                    </>
                  ) : (
                    <div>
                      <label
                        onClick={() =>
                          setFormplan({ ...plan, publish_research: false })
                        }
                        className="editprogress_label_pass1"
                      >
                        Success
                      </label>
                    </div>
                  )}
                  <br/>
                  <div className="file-upload-container">
                    <input type="file" id="file-upload" name="file" hidden />
                    <label htmlFor="file-upload" className="file-upload-label">
                      <div className="file-upload-icon">+</div>
                      Add files
                    </label>
                  </div>
                  <br />

                  <select name="type" className="dropdown" required>
                    <option value="Journal">Journal</option>
                    <option value="Proceeding">Proceeding</option>
                    {/* <option value="conference">Conference</option> */}
                  </select>
                  <br />
                  <input type="hidden" name="stdID" value={stdID} />
                  <button type="submit" className="button-save">
                    Upload File
                  </button>
                </form>
              </div>

              <p>Research</p>
              {files.map((file) => (
                <div className="file">
                  <InsertDriveFileIcon style={{ marginRight: "8px" }} />
                  <a
                    href={`http://localhost:56733/download/${file.id}`}
                    download
                  >
                    {file.filename}
                  </a>
                  {/* <DeleteForeverIcon onClick={() => handleDeleteP(file.id)}
                    style={{ color: 'red', cursor: 'pointer', fontSize: '30px' }} className="delete-icon"
                  /> */}
                  <DeleteForeverIcon onClick={() => handleClickOpen(file.id)}
                    style={{ color: 'red', cursor: 'pointer', fontSize: '30px' }} className="delete-icon"
                  />
                </div>
              ))}
              {/* {console.log(open)} */}
              <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    Are you sure you want to delete this research?
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                <Button onClick={() => handleDeleteP(publishToDelete)} color="error"
                  sx={{
                    backgroundColor: '#f44336', 
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    fontSize: '16px',
                    '&:hover': {
                      backgroundColor: '#e53935'  // สีเมื่อ hover
                    }
                  }}>
                    Delete
                  </Button>
                  <Button onClick={handleClose} color="primary">
                    Cancel
                  </Button>
                </DialogActions>
              </Dialog>

              <br />

              <div className="meet">
              <form onSubmit={addMeeting}>
                <label>Conference</label>
                <br /><br/>
                <input type="date" name="date-meeting" max={new Date().toISOString().split("T")[0]} />
                <br />
                <br />
                <input type="hidden" name="stdID" value={stdID} />
                <button type="submit" className="button-save">Add meeting</button>
              </form>
                <br />

              </div>



            </div>
            <div className="upload-topic">
              <p>Propose a Research Topic</p>
              <div className="box-research">
                <form onSubmit={uploadTopic} encType="multipart/form-data" className="choosefile">
                {plan.topic === false ? (
                    <>
                      <label
                        htmlFor="defense_exam"
                        className="editprogress_label1"
                        onClick={() =>
                          setFormplan({ ...plan, topic: true })
                        }
                      >
                        Unsuccess
                      </label>
                    </>
                  ) : (
                    <div>
                      <label
                        onClick={() =>
                          setFormplan({ ...plan, topic: false })
                        }
                        className="editprogress_label_pass1"
                      >
                        Success
                      </label>
                    </div>
                  )}
                  <br/>
                  <div className="file-upload-container">
                    <input type="file" id="topic-file-upload" name="file" hidden />
                    <label htmlFor="topic-file-upload" className="file-upload-label">
                      <div className="file-upload-icon">+</div>
                      Add Topic File
                    </label>
                  </div>
                  <br />

                  <input type="hidden" name="stdID" value={stdID} />
                  <button type="submit" className="button-save">Upload File</button>
                </form>
              </div>

              <p>Proposed Research Topic</p>
              {topic.map((file) => (
                <div className="file">
                  <InsertDriveFileIcon style={{ marginRight: "8px" }} />
                  <a href={`http://localhost:56733/downloadtopic/${file.id}`} download>
                    {file.filename}
                  </a>
                  <DeleteForeverIcon onClick={() => handleClickOpenT(file.id)}
                    style={{ color: 'red', cursor: 'pointer', fontSize: '30px' }} className="delete-icon"
                  />
                </div>
              ))}
              <Dialog open={openT} onClose={handleCloseT}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                  Are you sure you want to delete this research?
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                <Button onClick={() => handleDeleteT(topicToDelete)} color="error"
                  sx={{
                    backgroundColor: '#f44336', 
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    fontSize: '16px',
                    '&:hover': {
                      backgroundColor: '#e53935'  // สีเมื่อ hover
                    }
                  }}>
                    Delete
                  </Button>
                  <Button onClick={handleCloseT} color="primary">
                    Cancel
                  </Button>
                  
                </DialogActions>
              </Dialog>
              <br />

              

              
          
              <button onClick={handleUpdate} className="confirm">
                Confirm
              </button>


            </div>

          </div>
        </div>
      )}
    </div>
  );
};
