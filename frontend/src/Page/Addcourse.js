import React, { useState, useEffect } from 'react';
import axios from 'axios';

export const AddCourse = () => {
    const [courseID, setCourseID] = useState('');
    const [types, setTypes] = useState('');
    const [credit, setCredit] = useState('');
    const [planName, setPlanName] = useState('');
    const [searchPlanName, setSearchPlanName] = useState(''); // State for searching by plan name
    const [courses, setCourses] = useState([]); // State to store the list of courses

    // Function to fetch courses from the backend, optionally filtering by plan name
    const fetchCourses = async (planName = '') => {
        try {
            const response = await axios.get('http://localhost:56733/courses', {
                params: { planName }
            });
            console.log("Courses fetched:", response.data); // Check if the data is returned
            
            // Ensure response data is an array
            if (Array.isArray(response.data)) {
                setCourses(response.data);
            } else {
                setCourses([]); // Set an empty array if the response is not an array
                console.error("Unexpected response format: ", response.data);
            }
            
        } catch (error) {
            console.error("Error fetching courses", error);
            setCourses([]); // Set an empty array in case of error to avoid breaking the component
        }
    };
    

    // Fetch courses when the component mounts
    useEffect(() => {
        fetchCourses();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newCourse = { courseID, types, credit, planName };

        try {
            const response = await axios.post('http://localhost:56733/addcourse', newCourse);
            alert(response.data.message);
            fetchCourses(); // Fetch the updated list of courses after adding a new course
        } catch (error) {
            console.error("There was an error adding the course!", error);
            alert('Failed to add course');
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchCourses(searchPlanName); // Fetch courses based on the entered plan name
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <label>Course ID:
                    <input type="text" value={courseID} onChange={(e) => setCourseID(e.target.value)} required />
                </label>
                <label>Types:
                    <input type="text" value={types} onChange={(e) => setTypes(e.target.value)} />
                </label>
                <label>Credit:
                    <input type="number" value={credit} onChange={(e) => setCredit(e.target.value)} required />
                </label>
                <label>Plan Name:
                    <input type="text" value={planName} onChange={(e) => setPlanName(e.target.value)} />
                </label>
                <button type="submit">Add Course</button>
            </form>

            {/* Search form */}
            <form onSubmit={handleSearch}>
                <label>Search by Plan Name:
                    <input 
                        type="text" 
                        value={searchPlanName} 
                        onChange={(e) => setSearchPlanName(e.target.value)} 
                    />
                </label>
                <button type="submit">Search</button>
            </form>

            {/* Display the list of courses */}
            <h2>Added Courses</h2>
            <ul>
                {courses.map((course, index) => (
                    <li key={index}>
                        {course.courseID} - {course.types} - {course.credit} credits - Plan: {course.planName}
                    </li>
                ))}
            </ul>
        </>
    );
};
