import React from "react";
import axios from "axios";

export const TestSend = () => {
  const SentMail = (event) => {
    event.preventDefault();

    axios
      .post("http://localhost:56733/send-email")
      .then((response) => {
        alert("Mail sent successfully");
      })
      .catch((error) => {
        console.error("There was an error sending the data!", error);
      });
  };

  return (
    <>
      <p>Flask-Mail Tutorial</p>
      <form onSubmit={SentMail}>
        {/* Add form inputs if necessary */}
        <button type="submit">Send Mail</button>
      </form>
    </>
  );
};
