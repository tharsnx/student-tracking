from app import db

class Regits(db.Model):
    __tablename__ = 'regits'

    id = db.Column(db.Integer, primary_key=True)
    stdID = db.Column(db.String(100), nullable=False)
    courseID = db.Column(db.String(100), nullable=False)

    def __init__(self, stdID, courseID):
        self.stdID = stdID
        self.courseID = courseID