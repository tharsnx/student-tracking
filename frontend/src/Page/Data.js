import React, { useState, useEffect } from "react";
import axios from "axios";

export const Data = () => {
  const [data, setData] = useState(null);  // State to store the data
  const [loading, setLoading] = useState(true);  // State to handle loading
  const [error, setError] = useState(null);  // State to handle errors

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:56733/data");
        setData(response.data);  // Update state with the fetched data
        setLoading(false);  // Stop loading once data is fetched
      } catch (err) {
        setError("Error fetching data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);  // Empty dependency array means this runs only once, on component mount

  if (loading) {
    return <p>Loading...</p>;  // Render loading state
  }

  if (error) {
    return <p>{error}</p>;  // Render error state
  }

  // Render the data once it's fetched
  return (
    <div>
      <h1>Data from API</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>  {/* Render data as JSON */}
    </div>
  );
};
