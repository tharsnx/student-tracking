from app import db

class Course(db.Model):
    __tablename__ = 'course'

    id = db.Column(db.Integer, primary_key=True)
    courseID = db.Column(db.String(100), nullable=False)
    # types = db.Column(db.String(50))
    credit = db.Column(db.Integer)  # Ensure that `db.Integer` is used
    planName = db.Column(db.String(100))  # Ensure this is the correct field type

    def __init__(self, courseID, credit, planName):
        self.courseID = courseID
        # self.types = types
        self.credit = credit
        self.planName = planName
