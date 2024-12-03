import binascii
from flask import jsonify, request,send_file,abort
from flask_cors import CORS
from flask_login import login_user, login_required, logout_user, current_user
from app import app, db,login_manager
from app.models.user import User
from app.models.student import Student
from app.models.study_plan import Study_plan
from app.models.advisor import Advisor
from app.models.upload import Publish
from app.models.course import Course
from app.models.regist import Regits
from app.models.meeting import Meeting
from app.models.pretopic import Pretopic
import traceback
import secrets
import string
from flask_mail import Mail,Message
from io import BytesIO
import base64
import mimetypes
from datetime import datetime
# Configure the mail server
app.config['MAIL_SERVER'] = 'smtp.gmail.com'  # Replace with your mail server
app.config['MAIL_PORT'] = 587  # Usually 465 for SSL, 587 for TLS
app.config['MAIL_USERNAME'] = 'taruuiop@gmail.com'
app.config['MAIL_PASSWORD'] = 'kvqo qrve mmcn uzyi' #'pejz mjje kyyt igax'
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False

mail = Mail(app)


CORS(app, supports_credentials=True)
# mail = Mail(app)
@app.route('/home', methods=['GET'])
def get_data():
    data = {
        'key': 'Web',
        'number': 650510642
    }
    return jsonify(data)

@app.route('/api/advisors', methods=['GET'])
def get_advisors():
    advisors = Advisor.query.all()
    advisors_data = [{'id': advisor.id, 'name': advisor.name} for advisor in advisors]
    print("/////////////")
    print(advisors_data)
    return jsonify(advisors_data)


@app.route('/sent/data', methods=['POST'])
def post_data():
    try:
        data = request.json
        if not data or 'Fname' not in data or 'Lname' not in data:
            return jsonify({"message": "Invalid data"}), 400

        # print(data)
        new_user = User(fname=data['Fname'], lname=data['Lname'])
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "User added successfully"}), 201

    except Exception as e:
        print("An error occurred:", e)
        traceback.print_exc()
        return jsonify({"message": "An error occurred", "error": str(e)}), 500

@app.route('/addstudent', methods=['POST'])
def addStudent():
    try:
        data = request.form  # Retrieve data from formData
        file = request.files.get('picture')  # Retrieve image file
        email = data.get('email')

        # Validate required fields
        if not email or not data.get('stdID') or not data.get('name'):
            return jsonify({"message": "Missing required fields"}), 400

        # Check if the email already exists
        existing_student = Student.query.filter_by(email=email).first()
        if existing_student:
            return jsonify({"message": "Email already exists", "data": email}), 409

        # Process advisor information
        advisor_name = data.get('advisor')

        if advisor_name == 'Other':  # If "Other" is selected, use customAdvisor
            advisor_name = data.get('customAdvisor')

            # Validate that customAdvisor is provided
            if not advisor_name:
                return jsonify({"message": "Custom advisor name is required"}), 400

        # Ensure advisor_name is not None or empty
        advisor = Advisor.query.filter_by(name=advisor_name).first()
        if not advisor:  # If advisor doesn't exist, create a new one
            advisor_email = data.get('email_advisor')
            if not advisor_email:
                return jsonify({"message": "Advisor email is required"}), 400

            new_advisor = Advisor(
                name=advisor_name,
                email=advisor_email  # No tel field here
            )
            db.session.add(new_advisor)
            db.session.commit()
            advisor = Advisor.query.filter_by(name=advisor_name).first()

        # Generate password and hash it
        pw = generate_random_password()

        # Create student and user
        new_student = Student(
            stdID=data.get('stdID'),
            name=data.get('name'),
            status="study",
            email=email,
            tel=data.get('tel'),
            advisorID=advisor.id,
            progress = "0%"
        )

        picture_data = file.read() if file else None

        new_user = User(
            email=email,
            password=pw,  # Store hashed password
            fname=data.get('name').split(' ')[0],
            lname=data.get('name').split(' ')[1] if len(data.get('name').split(' ')) > 1 else '',
            isAdmin=False,
            picture=picture_data
        )

        # Create a new study plan, ensuring all required parameters are included
        new_plan = Study_plan(
        planName=data.get('degree'),  # Assuming this is the degree or name of the plan
        testEng=None,  # Set this to the correct file data as needed
        testEng_filename=None,  # Set this to the correct file name as needed
        comprehension=None,  # Set this to the correct file data as needed
        comprehension_filename=None,  # Set this to the correct file name as needed
        quality=None,  # Set this to the correct file data as needed
        quality_filename=None,  # Set this to the correct file name as needed
        study_planID=data.get('stdID'),  # Assuming stdID is used as the unique study_planID
        publish_research = False,  # Default value, adjust based on your logic
        credit=0,  # Default or actual value from your logic
        complete_course=False,  # Default value, adjust as needed
        defense_exam=False,
        topic = False
        )

        # Send email with generated password
        send_email(email, pw)

        # Add new records to the session
        db.session.add(new_student)
        db.session.add(new_user)
        db.session.add(new_plan)
        db.session.commit()

        return jsonify({"message": "Student added successfully", "data": {"email": email, "stdID": data.get('stdID')}}), 200

    except Exception as e:
        print("An error occurred:", e)
        traceback.print_exc()
        return jsonify({"message": "An error occurred", "error": str(e)}), 500



def generate_random_password(length=12):
    # Ensure the length is at least 8 characters
    if length < 8:
        raise ValueError("Password length must be at least 8 characters")
    # Define the possible characters in the password (A-Z, a-z, 0-9)
    alphabet = string.ascii_letters + string.digits
    # Generate a secure random password
    password = ''.join(secrets.choice(alphabet) for _ in range(length))
    
    return password

@app.route('/send-email', methods=['POST'])
def send_email(email,password):
    try:
        msg = Message(
            subject="Hello from CS CMU student tracking!!!",
            body=f"""This is your password for sign in to website http://localhost:3000/login
email: {email}
password: {password}""",
            sender="taruuiop@gmail.com",
            recipients=[email]
        )
        print("sddddd")
        mail.send(msg)
        return "Email sent successfully!"
    except Exception as e:
        app.logger.error("An error occurred while sending the email: %s", str(e))
        return "Failed to send email", 500

@app.route('/data', methods=['GET'])
# @login_required
def data():
    students = Student.query.filter_by(status="study").all()
    result = []
    no = 1
    for student in students:
        # Fetch the study plan associated with the student
        study_plan = Study_plan.query.filter_by(study_planID=student.stdID).first()
        
        # Fetch the advisor details associated with the student
        advisor = Advisor.query.filter_by(id=student.advisorID).first()

        result.append({
            'no': no,
            'name': student.name,
            'email': student.email,
            'tel': student.tel,
            'stdID': student.stdID,
            'degree': study_plan.planName ,
            'advisor': advisor.name ,
            'advisor_email': advisor.email ,
            'progress': student.progress,  # Update this logic for progress as needed
        })
        no += 1
    print(result)
    return jsonify(result)


################################################################333
@login_manager.user_loader
def load_user(user_id):
    # since the user_id is just the primary key of our
    # user table, use it in the query for the user
    return User.query.get(int(user_id))

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    student = Student.query.filter_by(email=data['email']).first()
    print(data['email'],data['password'])
    print("////////////////////////")
    print(user.email,user.password)
    if user and user.password == data['password']:
        login_user(user, remember=True)
        print(current_user)
        if user.isAdmin:
            return jsonify({"message": "Login successful", "isAdmin": user.isAdmin,"currentUser":user.id,"stdID":0}), 200
        return jsonify({"message": "Login successful", "isAdmin": user.isAdmin,"currentUser":user.id,"stdID":student.stdID}), 200
    return jsonify({"message": "Invalid credentials"}), 401

from flask import request, jsonify
import base64
import binascii

@app.route('/studentfix', methods=['POST'])
def studentfix():
    try:
        # Receive JSON data
        data = request.json

        # Debugging: Show received data (uncomment during development)
        # print("Received data:", data)

        # Check required fields
        required_fields = ['stdID', 'name', 'tel', 'email', 'degree', 'advisor', 'email_advisor']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({"error": f"{field} is required and cannot be empty"}), 400

        # Find existing student
        student = Student.query.filter_by(stdID=data['stdID']).first()
        if student is None:
            return jsonify({"error": "Student not found"}), 404

        # Update student information
        student.name = data['name']
        student.tel = data['tel']
        student.email = data['email']

        # Look for existing advisor
        existing_advisor = Advisor.query.filter_by(name=data['advisor']).first()

        if existing_advisor:
            # If existing advisor's email matches the new email, just use them
            if existing_advisor.email == data['email_advisor']:
                print("Advisor data is the same, no changes made.")
                student.advisorID = existing_advisor.id  # Use the old advisor
            else:
                # Check for an advisor with the new email
                existing_email_advisor = Advisor.query.filter_by(email=data['email_advisor']).first()
                if existing_email_advisor:
                    # If the email exists, update student with this advisor
                    student.advisorID = existing_email_advisor.id
                    print("Advisor email exists, updating student with existing advisor.")
                else:
                    # If not, update the existing advisor's email
                    existing_advisor.email = data['email_advisor']
                    db.session.commit()  # Save changes to the existing advisor
                    student.advisorID = existing_advisor.id
                    print("Updated existing advisor's email.")
        else:
            # Create a new advisor if none exists
            new_advisor = Advisor(name=data['advisor'], email=data['email_advisor'])
            db.session.add(new_advisor)
            db.session.flush()  # Ensure the new advisor's ID is available
            student.advisorID = new_advisor.id
            print("New advisor created.")

        # Handle image if provided
        if 'picture' in data and data['picture']:
            user = User.query.filter_by(email=student.email).first()
            if user:
                image_data = data['picture']  # Use the correct field name here
                if "," in image_data:
                    _, image_data = image_data.split(",", 1)  # Remove header
                try:
                    decoded_image = base64.b64decode(image_data)
                    user.picture = decoded_image  # Replace old picture with new picture
                    print("Updated user's picture.")
                except binascii.Error:
                    return jsonify({"error": "Invalid image data"}), 400

        # Commit all changes to the database
        db.session.commit()
        print("Updated student data:", student)  # Debugging: show updated student data
        return jsonify({"message": "Student information updated successfully"}), 200

    except Exception as e:
        db.session.rollback()  # Rollback on error
        print("Error during studentfix:", str(e))  # Debugging: show error
        return jsonify({"error": "An error occurred while updating student information.", "details": str(e)}), 500




@app.route('/currentstudent', methods=['GET'])
def currentstudent():
    stdID = request.args.get('stdID')

    # Check if stdID is provided
    if not stdID:
        return jsonify({"error": "stdID is required"}), 400

    # Fetch the student record
    student = Student.query.filter_by(stdID=stdID).first()

    if student is None:
        return jsonify({"error": "Student not found"}), 404

    # Fetch the advisor
    advisor = Advisor.query.filter_by(id=student.advisorID).first()

    # Prepare the response data
    advisor_name = advisor.name if advisor else "Unknown Advisor"
    advisor_email = advisor.email if advisor else "Unknown Email"
    if advisor is None:
        print(f"Advisor not found for student: {stdID}")  # Log the missing advisor for debugging

    # Fetch the study plan
    plan = Study_plan.query.filter_by(study_planID=student.stdID).first()  # Assuming this is the correct key
    plan_name = plan.planName if plan else "No plan available"

    # Fetch user details if exists
    user = User.query.filter_by(email=student.email).first()

    current_data = {
        'name': student.name,
        'tel': student.tel,
        'email': student.email,
        'plan': plan_name,
        'picture': None,  # Initialize as None
        'advisor': advisor_name,
        'advisor_email': advisor_email,
    }

    if user and user.picture:
        current_data['picture'] = base64.b64encode(user.picture).decode('utf-8')

    return jsonify(current_data), 200


def get_file_data(file_binary, filename):
    if file_binary:
        return {
            'file': base64.b64encode(file_binary).decode('utf-8'),
            'fileType': mimetypes.guess_type(filename)[0]  # Pass actual filename
        }
    return None


@app.route('/currentstudentplan', methods=['GET'])
def currentstudentplan():
    stdID = request.args.get('stdID')
    study_plan = Study_plan.query.filter_by(study_planID=stdID).first()

    if study_plan is None:
        return jsonify({"error": "Student not found"}), 404
    count_topic = Pretopic.query.filter_by(stdID=stdID).count()
    if study_plan.planName == "Master Degree Plan A1":
        # if study_plan.nPublish_journal >= 1 and study_plan.nPublish_proceeding >= 1:
        #     pass_published = True
        # else:
        #     pass_published = False
        # if count_topic >= 2:
        #     pass_pretopic = True
        # else:
        #     pass_pretopic = False
        current_data = {
        'English_Test': get_file_data(study_plan.testEng, 'testEng.pdf'),
        'Published_Research': study_plan.publish_research,
        'Propose_a_Research_Topic': study_plan.topic,
        'Complete_all_course': study_plan.complete_course,
        'Defense_Examination' : study_plan.defense_exam
        }
    elif study_plan.planName == "Master Degree Plan A2":
        # if study_plan.nPublish_journal >= 1 or study_plan.nPublish_proceeding >= 1:
        #     pass_published = True
        # else:
        #     pass_published = False
        # if count_topic >= 1:
        #     pass_pretopic = True
        # else:
        #     pass_pretopic = False
        current_data = {
        'English_Test': get_file_data(study_plan.testEng, 'testEng.pdf'),
        'Published_Research': study_plan.publish_research,
        'Propose_a_Research_Topic': study_plan.topic,
        'Complete_all_course': study_plan.complete_course,
        'Defense_Examination' : study_plan.defense_exam
        }
    elif study_plan.planName == "Master Degree Plan B":
        # if study_plan.nPublish_conferrence >= 1:
        #     pass_published = True
        # else:
        #     pass_published = False
        # if count_topic >= 1:
        #     pass_pretopic = True
        # else:
        #     pass_pretopic = False
        current_data = {
        'English_Test': get_file_data(study_plan.testEng, 'testEng.pdf'),
        'Comprehensive_Examination': get_file_data(study_plan.comprehension, 'comprehension.pdf'),
        'Published_Research': study_plan.publish_research,
        'Propose_a_Research_Topic': study_plan.topic,
        'Complete_all_course': study_plan.complete_course,
        'Defense_Examination' : study_plan.defense_exam
    }
    elif study_plan.planName == "Ph.D Degree":
        # if study_plan.nPublish_journal >= 1 and study_plan.nPublish_proceeding >= 2:
        #     pass_published = True
        # else:
        #     pass_published = False
        # if count_topic >= 3:
        #     pass_pretopic = True
        # else:
        #     pass_pretopic = False
        current_data = {
        'English_Test': get_file_data(study_plan.testEng, 'testEng.pdf'),
        'Published_Research': study_plan.publish_research,
        'Propose_a_Research_Topic': study_plan.topic,
        'Qualifying_Examination': get_file_data(study_plan.quality, 'quality.pdf'),
        'Complete_all_course': study_plan.complete_course,
        'Defense_Examination' : study_plan.defense_exam
    }

    return jsonify(current_data), 200





####################################################3
@app.route('/uploadfile', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'message': "No file part in the request"}), 400

    file = request.files['file']
    stdID = request.form.get('stdID')
    types = request.form.get('type')
    print(stdID,types)
    if file.filename == '':
        return jsonify({'message': "No selected file"}), 400

    # Check if a file with the same name already exists for this stdID
    existing_file = Publish.query.filter_by(stdID=stdID, filename=file.filename).first()
    if existing_file:
        return jsonify({'message': "This file already exists for the student"}), 400

    # Find the corresponding study plan for the given stdID
    plan = Study_plan.query.filter_by(study_planID=stdID).first()
    
    # Update the correct publication count based on the types value
    if plan:
        upload = Publish(stdID=stdID, filename=file.filename, file=file.read(), types=types)
        db.session.add(upload)

        # Commit both the study plan update and the file upload to the database
        db.session.commit()

        return jsonify({'message': "File uploaded and study plan updated successfully"}), 200
    else:
        return jsonify({'message': "Study plan not found for this student ID"}), 404



@app.route('/downloadplan/<upload_id>/<type_exam>')
def downloadplan(upload_id, type_exam):
    study_plan = Study_plan.query.filter_by(study_planID=upload_id).first()
    if not study_plan:
        return jsonify({"error": "Study plan not found"}), 404

    if type_exam == "testEng":
        file_data = study_plan.testEng
        filename = study_plan.testEng_filename
        print(filename)
    elif type_exam == "comprehension":
        file_data = study_plan.comprehension
        filename = study_plan.comprehension_filename
    elif type_exam == "quality":
        file_data = study_plan.quality
        filename = study_plan.quality_filename
    elif type_exam == "publishExam":
        file_data = study_plan.publishExam
        filename = study_plan.publishExam_filename
    else:
        return jsonify({"error": "Invalid exam type"}), 400

    if not file_data:
        return jsonify({"error": "No file available for the requested exam type"}), 404

    # Use the stored file name when sending the file
    return send_file(BytesIO(file_data), download_name=filename, as_attachment=True)



@app.route('/download/<upload_id>')
def download(upload_id):
    upload = Publish.query.filter_by(id=upload_id).first()
    return send_file(BytesIO(upload.file), download_name=upload.filename, as_attachment=True)


@app.route('/uploads', methods=['GET'])
def get_uploaded_files():
    stdID = request.args.get('stdID')  # Get stdID from the request parameters
    if not stdID:
        return jsonify({"message": "stdID is required"}), 400
    try:
        uploads = Publish.query.filter_by(stdID=stdID).all()  # Get all uploads for the given stdID
        files = [{'id': upload.id, 'filename': upload.types} for upload in uploads]
        return jsonify({'files': files}), 200
    except Exception as e:
        print("An error occurred:", e)
        traceback.print_exc()
        return jsonify({"message": "An error occurred", "error": str(e)}), 500


@app.route('/editprogress', methods=['POST'])
def editprogress():
    try:
        # Extract form data and file uploads
        study_planID = request.form.get('stdID')
        regits_courses = request.form.get('Regits_Course')  # Get the Regits_Course input
        testEng_file = request.files.get('testEng')
        comprehensive_file = request.files.get('comprehensiveExam')
        qualifying_file = request.files.get('QualifyingExam')
        nPublish = request.form.get('nPublish')
        set_complete = request.form.get('Complete_Course')  # New field for setting completion status
        set_defense = request.form.get('defense_exam')
        publish_research = request.form.get('Published_Research')
        topic = request.form.get('Topic')

        # Debug print to inspect form data and file uploads
        print({
            "study_planID": study_planID,
            "regits_courses": regits_courses,  # Debugging Regits_Course
            "testEng_file": testEng_file,
            "comprehensive_file": comprehensive_file,
            "qualifying_file": qualifying_file,
            "nPublish": nPublish,
            "set_complete": set_complete,  # Added for debugging
            "set_defense" : set_defense
        })

        # Find the study plan by student ID
        study_plan = Study_plan.query.filter_by(study_planID=study_planID).first()
        if not study_plan:
            return jsonify({"error": "Study plan not found"}), 404

        # Handle file uploads (same as your existing logic)
        if testEng_file is not None and testEng_file.filename != '':
            study_plan.testEng = testEng_file.read()
            study_plan.testEng_filename = testEng_file.filename
        elif testEng_file is not None and testEng_file.filename == '':
            study_plan.testEng = None
            study_plan.testEng_filename = None

        if comprehensive_file is not None and comprehensive_file.filename != '':
            study_plan.comprehension = comprehensive_file.read()
            study_plan.comprehension_filename = comprehensive_file.filename
        elif comprehensive_file is not None and comprehensive_file.filename == '':
            study_plan.comprehension = None
            study_plan.comprehension_filename = None

        if qualifying_file is not None and qualifying_file.filename != '':
            study_plan.quality = qualifying_file.read()
            study_plan.quality_filename = qualifying_file.filename
        elif qualifying_file is not None and qualifying_file.filename == '':
            study_plan.quality = None
            study_plan.quality_filename = None

        # Update nPublish if provided
        if nPublish:
            study_plan.nPublish = int(nPublish)

        if publish_research == "true":
            study_plan.publish_research = True
        else:
            study_plan.publish_research = False

        if topic == "true":
            study_plan.topic = True
        else:
            study_plan.topic = False

        # Set study plan completion status if provided
        if set_complete == "true":
            study_plan.complete_course = True
        else:
            study_plan.complete_course = False

        if set_defense == "true":
            study_plan.defense_exam = True
        else:
            study_plan.defense_exam = False


        # Handle Regits_Course
        
        if regits_courses:
            # Split the string by commas and create Regits entries
            course_ids = regits_courses.split(",")
            for course_id in course_ids:
                course_id = course_id.strip()  # Trim any whitespace
                if course_id:  # Check if the course_id is not empty
                    # Check if the Regits entry already exists
                    courses = Course.query.filter_by(courseID=course_id).first()
                    existing_regit = Regits.query.filter_by(stdID=study_planID, courseID=course_id).first()
                    if not existing_regit:  # Only create a new entry if it doesn't exist
                        new_regit = Regits(stdID=study_planID, courseID=course_id)
                        study_plan.credit += courses.credit
                        db.session.add(new_regit)

        # Commit changes to the database
        db.session.commit()
        return jsonify({"message": "Progress updated successfully"}), 200

    except Exception as e:
        print("Error:", e)  # Log the error for debugging
        return jsonify({"error": str(e), "message": "An error occurred while updating progress."}), 500



@app.route('/addcourse', methods=['POST'])
def add_course():
    data = request.get_json()
    print(data)
    new_course = Course(
        courseID=data['courseID'],
        types=data['types'],
        credit=data['credit'],
        planName=data['planName']
    )
    db.session.add(new_course)
    db.session.commit()

    print(f"Added course with ID: {new_course.courseID}")  # Debugging log

    return jsonify({'message': 'Course added successfully!'}), 201



@app.route('/courses', methods=['GET'])
def get_courses():
    plan_name = request.args.get('planName')
    
    if plan_name:
        courses = Course.query.filter_by(planName=plan_name).all()
    else:
        courses = Course.query.all()
    
    if not courses:
        return jsonify({'message': 'No courses found'}), 200

    return jsonify([{
        'courseID': course.courseID,
        'types': course.types,
        'credit': course.credit,
        'planName': course.planName
    } for course in courses]), 200


@app.route('/planNames', methods=['GET'])
def get_plan_names():
    plan_names = db.session.query(Course.planName).distinct().all()
    plan_names_list = [planName[0] for planName in plan_names]  # Flatten the result
    return jsonify(plan_names_list)


@app.route('/getcourses', methods=['GET'])
def get_courses_by_stdID():
    stdID = request.args.get('stdID')
    if not stdID:
        return jsonify({'error': 'stdID is required'}), 400

    # Fetch the study plan using stdID
    study_plan = Study_plan.query.filter_by(study_planID=stdID).first()
    if not study_plan:
        return jsonify({'error': 'Study plan not found'}), 404

    # Mapping study plan names from the frontend to the backend planName
    planName_map = {
        "Master Degree Plan A1": "M.",
        "Master Degree Plan A2": "M.",
        "Master Degree Plan B": "M.",
        "Ph.D Degree": "Ph.D.",
    }

    planName = planName_map.get(study_plan.planName, None)
    if not planName:
        return jsonify({'error': 'Plan name mapping not found'}), 404

    # Fetch courses using the mapped plan name
    courses = Course.query.filter_by(planName=planName).all()
    if not courses:
        return jsonify({'error': 'No courses found for this study plan'}), 404

    # Fetch registered courses for the student
    regist = Regits.query.filter_by(stdID=stdID).all()
    registered_course_ids = {reg.courseID for reg in regist} if regist else set()

    # Fetch meeting information for the student
    meeting = Meeting.query.filter_by(stdID=stdID).all()

    # Create course list with registration status
    course_list = [
        {
            'courseID': course.courseID,
            'credit': course.credit,
            'planName': course.planName,
            'registered': course.courseID in registered_course_ids
        }
        for course in courses
    ]

    return jsonify({
        'courses': course_list, 
        'credit': study_plan.credit,
        'meeting': [meet.date.strftime('%Y-%m-%d') for meet in meeting]  # Convert meeting dates to string
    }), 200



@app.route('/updatepercent', methods=['POST'])
def updateper():
    data = request.get_json()  # Get the JSON data from the request
    stdID = data.get('stdID')  # Extract stdID
    progressPercentage = data.get('progressPercentage')  # Extract progressPercentage

    student = Student.query.filter_by(stdID=stdID).first()
    
    if student:
        student.progress = f"{progressPercentage}%"
        db.session.commit()  # Save changes to the database

        print(f"Student ID: {stdID}, Progress Percentage: {progressPercentage}%")
        return jsonify({"message": "Progress percentage updated successfully"}), 200
    else:
        return jsonify({"error": "Student not found"}), 404

@app.route('/deleteStudent/<stdID>', methods=['DELETE'])
def delete_student(stdID):
    # Find the student
    student = Student.query.filter_by(stdID=stdID).first()
    user = User.query.filter_by(email=student.email).first()
    
    if student:
        # Delete associated study plans
        study_plans = Study_plan.query.filter_by(study_planID=stdID).all()  # Assuming stdID is in Study_plan
        for plan in study_plans:
            db.session.delete(plan)
        
        # Delete associated publish records
        publishes = Publish.query.filter_by(stdID=stdID).all()  # Assuming stdID is in Publish
        for publish in publishes:
            db.session.delete(publish)

        # Finally, delete the student
        db.session.delete(student)
        db.session.delete(user)
        db.session.commit()  # Commit all deletions to the database
        
        return jsonify({"message": "Student and associated records deleted successfully"}), 200
    else:
        return jsonify({"error": "Student not found"}), 404


@app.route('/addadmin', methods=['POST'])
def add_admin():
    data = request.form  # Retrieve data from formData
    file = request.files.get('picture')  # Retrieve image file

    # Check if user with this email already exists
    user = User.query.filter_by(email=data.get('email_admin')).first()
    if user:
        return jsonify({"error": "User with this email already exists"}), 409

    # Hash the password before storing it
    # hashed_password = generate_password_hash(data.get('pw_admin')).decode('utf-8')

    # Process the profile picture
    print((file != None ))
    picture_data = file.read() if file else None

    # Create the new admin user
    new_admin = User(
        email=data.get('email_admin'),
        password=data.get('pw_admin'),  # Store hashed password
        fname=data.get('name_admin').split(' ')[0],
        lname=data.get('name_admin').split(' ')[1] if len(data.get('name_admin').split(' ')) > 1 else '',
        isAdmin=True,
        picture=picture_data
    )

    # Add the new admin to the database
    db.session.add(new_admin)
    db.session.commit()

    return jsonify({"message": "Admin added successfully"}), 201

@app.route('/alladmins', methods=['GET'])
def get_all_admins():
    admins = User.query.filter_by(isAdmin=True).all()
    admin_list = []
    for admin in admins:
        admin_data = {
            'id' :admin.id,
            'name': f"{admin.fname} {admin.lname}",
            'email': admin.email,
            'tel': "0984892124",
            'picture': base64.b64encode(admin.picture).decode('utf-8') if admin.picture else None
        }
        admin_list.append(admin_data)
    return jsonify(admin_list), 200


@app.route('/uptoalumni', methods=['POST'])
def uptoalumni():
    stdID = request.args.get('stdID')  # Get stdID from query parameters
    print("Received stdID:", stdID)  # Log the received stdID
    student = Student.query.filter_by(stdID=stdID).first()
    if student:
        student.status = "alumni"
        db.session.commit()
        return jsonify({"message": "Student status updated to alumni"}), 200
    else:
        return jsonify({"message": "Student not found"}), 404

@app.route('/getalumni', methods=['GET'])
def getalumni():
    # Fetch students with status "alumni"
    alumni = Student.query.filter_by(status="alumni").all()

    if alumni:
        # Prepare a list of alumni data to return
        alumni_data = []
        for student in alumni:
            user = User.query.filter_by(email=student.email).first()  # Fetch the user for the current student
            picture_base64 = None
            
            # Use base64 encoding for the picture
            if user and user.picture:
                picture_base64 = base64.b64encode(user.picture).decode('utf-8')  # Encode binary data to base64

            alumni_data.append({
                'stdID': student.stdID,  # Include any other fields you need
                'name': student.name,
                'email': student.email,
                'tel': student.tel,
                'picture': picture_base64  # Use the base64 encoded picture
            })

        return jsonify(alumni_data), 200
    else:
        return jsonify({"message": "No alumni found"}), 404
    

@app.route('/addmeeting', methods=['POST'])
def addmeeting():
    try:
        # Get data from the request
        data = request.get_json()
        stdID = data.get('stdID')
        date = data.get('date')

        # Convert date string to datetime object
        meeting_date = datetime.strptime(date, '%Y-%m-%d')

        # Create new meeting object
        new_meeting = Meeting(stdID=stdID, date=meeting_date)

        # Add to database
        db.session.add(new_meeting)
        db.session.commit()

        return jsonify({"message": "Meeting added successfully"}), 200

    except Exception as e:
        print("Error adding meeting:", e)
        return jsonify({"message": "Failed to add meeting"}), 500
    

@app.route('/uploadtopic', methods=['POST'])
def uploadtopic():
    # Check if a file part is present in the request
    if 'file' not in request.files:
        return jsonify({'message': "No file part in the request"}), 400

    file = request.files['file']
    stdID = request.form.get('stdID')

    # Check if the filename is empty
    if file.filename == '':
        return jsonify({'message': "No selected file"}), 400
    
    # Check if the file already exists for the given stdID
    existing_file = Pretopic.query.filter_by(stdID=stdID, filename=file.filename).first()
    if existing_file:
        return jsonify({'message': "This file already exists for the student"}), 400

    # Save the new file in the Pretopic table
    upload = Pretopic(stdID=stdID, filename=file.filename, file=file.read())
    db.session.add(upload)

    # Commit the file upload to the database
    db.session.commit()

    return jsonify({'message': "File uploaded successfully"}), 200  # Return success message


@app.route('/loadstopic', methods=['GET'])
def get_uploaded_Topic():
    stdID = request.args.get('stdID')  # Get stdID from the request parameters
    if not stdID:
        return jsonify({"message": "stdID is required"}), 400
    try:
        uploads = Pretopic.query.filter_by(stdID=stdID).all()  # Get all uploads for the given stdID
        files = [{'id': upload.id, 'filename': upload.filename} for upload in uploads]
        return jsonify({'files': files}), 200
    except Exception as e:
        print("An error occurred:", e)
        traceback.print_exc()
        return jsonify({"message": "An error occurred", "error": str(e)}), 500
    
@app.route('/downloadtopic/<upload_id>')
def downloadtopic(upload_id):
    upload = Pretopic.query.filter_by(id=upload_id).first()
    return send_file(BytesIO(upload.file), download_name=upload.filename, as_attachment=True)


@app.route('/deleteAdmin/<stdID>', methods=['DELETE'])
def delete_admin(stdID):
    # Find the student
    # student = Student.query.filter_by(stdID=stdID).first()
    user = User.query.filter_by(id=stdID).first()
    
    if user:
        # Delete associated study plans
        db.session.delete(user)
        db.session.commit()  # Commit all deletions to the database
        
        return jsonify({"message": "Student and associated records deleted successfully"}), 200
    else:
        return jsonify({"error": "Student not found"}), 404
    
@app.route('/deletepublish/<stdID>', methods=['DELETE'])
def delete_publish(stdID):
    # Find the publish record by ID
    publish = Publish.query.filter_by(id=stdID).first()
    
    if publish:
        # Delete the publish record
        db.session.delete(publish)
        db.session.commit()  # Commit the deletion to the database
        
        return jsonify({"message": "Publish record deleted successfully"}), 200
    else:
        return jsonify({"error": "Publish record not found"}), 404


@app.route('/deletetopic/<stdID>', methods=['DELETE'])
def delete_topic(stdID):
    # Find the publish record by ID
    topic = Pretopic.query.filter_by(id=stdID).first()
    
    if topic:
        # Delete the publish record
        db.session.delete(topic)
        db.session.commit()  # Commit the deletion to the database
        
        return jsonify({"message": "Publish record deleted successfully"}), 200
    else:
        return jsonify({"error": "Publish record not found"}), 404


# @app.route('/uploadsTopic', methods=['GET'])
# def get_uploaded_topic():
#     stdID = request.args.get('stdID')  # Get stdID from the request parameters
#     if not stdID:
#         return jsonify({"message": "stdID is required"}), 400
#     try:
#         uploads = Pretopic.query.filter_by(stdID=stdID).all()  # Get all uploads for the given stdID
#         files = [{'id': upload.id, 'filename': upload.filename} for upload in uploads]
#         return jsonify({'files': files}), 200
#     except Exception as e:
#         print("An error occurred:", e)
#         traceback.print_exc()
#         return jsonify({"message": "An error occurred", "error": str(e)}), 500
    

# @app.route('/downloadtopic/<upload_id>')
# def downloadtopic(upload_id):
#     upload = Pretopic.query.filter_by(id=upload_id).first()
#     return send_file(BytesIO(upload.file), download_name=upload.filename, as_attachment=True)