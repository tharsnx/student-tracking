import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/progressbar.css";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

export const ProgressBar = ({ stdID, onProgressUpdate }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [steps, setSteps] = useState([]);
  const [stepNames, setStepNames] = useState([]);
  const [files, setFiles] = useState([]);
  const [topics, setTopics] = useState([]);
  const [error, setError] = useState("");

  const getStepName = (key) => {
    switch (key) {
      case "testEng":
        return "English Test";
      case "comprehension":
        return "Comprehensive Examination";
      case "quality":
        return "Qualifying_Examination";
      case "publishExam":
        return "Publish Exam";
      case "ตีพิมพ์วิจัย":
        return "Published_Research";
      default:
        return key; // Fallback to the key itself if not found
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
      setTopics(response.data.files);
    } catch (err) {
      setError("Error fetching files");
    }
  };

  useEffect(() => {
    const fetchStudentPlan = async () => {
      if (!stdID) return;

      try {
        const response = await axios.get(
          `http://localhost:56733/currentstudentplan?stdID=${stdID}`
        );
        const data_get = response.data;
        // console.log(data_get);
        
        const newSteps = Object.keys(data_get);
        const newStepNames = newSteps.map(getStepName);

        // Logging data to ensure correct retrieval
        // console.log("Fetched steps:", newSteps);
        // console.log("Data received from API:", data_get);

        const fetchedCompletedSteps = newSteps.reduce((acc, key) => {
          if (data_get[key]) {
            acc.push(key);
          }
          return acc;
        }, []);

        setSteps(newSteps); // Updated steps state
        // console.log(steps);
        
        setStepNames(newStepNames);
        setCompletedSteps(fetchedCompletedSteps);

        setCurrentStep(
          fetchedCompletedSteps.length > 0
            ? fetchedCompletedSteps.length
            : 1
        );

        const progressPercentage = Math.floor(
          (fetchedCompletedSteps.length / newSteps.length) * 100
        );

        await axios.post("http://localhost:56733/updatepercent", {
          stdID,
          progressPercentage,
        });

        onProgressUpdate(progressPercentage);
      } catch (error) {
        console.error("Error fetching student plan:", error);
      }
    };

    fetchStudentPlan();
    fetchUploadedFiles();
    fetchUploadedTopic();
  }, [stdID, onProgressUpdate]);

  // useEffect(() => {
  //   // Log whenever steps change
  //   console.log("Updated steps:", steps);
  // }, [steps]);
  // console.log(steps);
  
  return (
    <div className="progress-bar-container vertical" style={{ flex: 1 }}>
      {steps.map((step, index) => (
        <div
          key={index}
          className={`step ${
            completedSteps.includes(step) ? "completed" : ""
          } ${currentStep === index + 1 ? "active" : ""}`}
          style={{ cursor: "pointer" }}
        >
          <div className="circle"></div>
          <div className="step-name">
            {stepNames[index]}

            {step === "English_Test" && completedSteps.includes("English_Test") && (
              <div className="file">
                <InsertDriveFileIcon style={{ marginRight: "8px" }} />
                <a
                  href={`http://localhost:56733/downloadplan/${stdID}/testEng`}
                  download
                >
                  TestEnglish_{stdID}
                </a>
              </div>
            )}

            {step === "Comprehensive_Examination" &&
              completedSteps.includes("Comprehensive_Examination") && (
                <div className="file">
                  <InsertDriveFileIcon style={{ marginRight: "8px" }} />
                  <a
                    href={`http://localhost:56733/downloadplan/${stdID}/comprehension`}
                    download
                  >
                    Comprehension_{stdID}
                  </a>
                </div>
              )}

            {step === "Qualifying_Examination" && completedSteps.includes("Qualifying_Examination") && (
              <div className="file">
                <InsertDriveFileIcon style={{ marginRight: "8px" }} />
                <a
                  href={`http://localhost:56733/downloadplan/${stdID}/quality`}
                  download
                >
                  Quality_{stdID}
                </a>
              </div>
            )}

            {stepNames[index] === "Published_Research" && (
              <>
                {files.map((file) => (
                  <div className="file" key={file.id}>
                    <InsertDriveFileIcon style={{ marginRight: "8px" }} />
                    <a href={`http://localhost:56733/download/${file.id}`} download>
                      {file.filename}
                    </a>
                  </div>
                ))}
                {/* Adjust height based on number of files */}
                <div
                  className="line"
                  style={{
                    height: `${files.length * 20}px`, // Example: 20px per file
                  }}
                ></div>
              </>
            )}


            {stepNames[index] === "Propose_a_Research_Topic" && (
              <>
                {topics.map((file) => (
                  <div className="file" key={file.id}>
                    <InsertDriveFileIcon style={{ marginRight: "8px" }} />
                    <a href={`http://localhost:56733/downloadtopic/${file.id}`} download>
                      {file.filename}
                    </a>
                  </div>
                ))}
                {/* Adjust height based on number of files */}
                <div
                  className="line"
                  style={{
                    height: `${files.length * 20}px`, // Example: 20px per file
                  }}
                ></div>
              </>
            )}


          </div>

          {index < steps.length - 1 && <div className="line"></div>}
        </div>
      ))}
    </div>
  );
};

export default ProgressBar;
