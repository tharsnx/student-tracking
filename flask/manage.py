from flask.cli import FlaskGroup
from app import app, db
from app.models.user import User
from app.models.student import Student  # Ensure this is imported
from app.models.advisor import Advisor
from app.models.course import Course

cli = FlaskGroup(app)

@cli.command("create_db")
def create_db():
    db.drop_all()
    db.create_all()
    db.session.commit()

@cli.command("seed_db")
def seed_db():

    db.session.add(User(email="taruuiop@gmail.com",password="sarantar",fname="Saran", lname="Jatupornpitakkul",isAdmin=True,picture=None))
    # db.session.add(User(email="Nanticha.mangpun@gmail.com",password="1234",fname="Aom", lname="Nanticha",isAdmin=True,picture=None))
    # db.session.add(User(email="arnarock6696@gmail.com",password="050396696a",fname="Anajak", lname="Chuamuangpahn",isAdmin=True,picture=None))
    # db.session.add(User(email="ningguri@gmail.com",password="ningguri",fname="Atittaya", lname="Kongtaen",isAdmin=True,picture=None))
    # db.session.add(Advisor(name="Kittipich",email="Kittipich@gmail.com"))
    # db.session.add(Advisor(name="Other",email="none@gmail.com"))
    # First set of courses with planName "M."
    courses_m = [
        ("204712", 3), ("204713", 3), ("204711", 3), ("204775", 3),
        ("204755", 3), ("204733", 3), ("204753", 3), ("204732", 3),
        ("204715", 3), ("204714", 3), ("204776", 3), ("204767", 3),
        ("204772", 3), ("204779", 3), ("204735", 3), ("204721", 3),
        ("204717", 3), ("204777", 3), ("204768", 3), ("204731", 3),
        ("204789", 3), ("204764", 3), ("204725", 3), ("204763", 3),
        ("204722", 3), ("204769", 3), ("204741", 3), ("204799", 12),
        ("204791", 1), ("204736", 3), ("204771", 3), ("204728", 3),
        ("204723", 3), ("204742", 3), ("204700", 2), ("204737", 3),
        ("204754", 3), ("204729", 3), ("204726", 3), ("204752", 3),
        ("204701", 2), ("204797", 36), ("204731", 3), ("204792", 2)
    ]

    # Adding the first set of courses to the database
    for courseID, credit in courses_m:
        course = Course(courseID=courseID, credit=credit, planName="M.")
        db.session.add(course)

    # Second set of courses with planName "Ph.D."
    courses_phd = [
        ("204898", 48), ("204891", 3), ("204712", 3), ("204725", 3),
        ("204732", 3), ("204735", 3), ("204713", 3), ("204715", 3),
        ("204717", 3), ("204721", 3), ("204722", 3), ("204724", 3),
        ("204728", 3), ("204736", 3), ("204752", 3), ("204753", 3),
        ("204754", 3), ("204763", 3), ("204764", 3), ("204765", 3),
        ("204767", 3), ("204771", 3), ("204774", 3), ("204803", 3),
        ("204809", 3), ("204814", 3), ("204816", 3), ("204821", 3),
        ("204881", 3), ("204882", 3), ("206751", 3)
    ]

    # Adding the second set of courses to the database
    for courseID, credit in courses_phd:
        course = Course(courseID=courseID, credit=credit, planName="Ph.D.")
        db.session.add(course)

    # Adding a sample user

    
    # Uncomment the line below if you want to add a student
    # db.session.add(Student(stdID="650510642", name="Saran Jatupornpitakkul", status="study", email="Saran_jatuporn@cmu.ac.th", tel="0984892124"))

    db.session.commit()  # Commit all the changes


if __name__ == "__main__":
    cli()
