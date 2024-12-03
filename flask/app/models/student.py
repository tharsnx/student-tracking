# app/models/student.py
from app import db

class Student(db.Model):
    __tablename__ = 'student'

    id = db.Column(db.Integer, primary_key=True)
    stdID = db.Column(db.String(100), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    tel = db.Column(db.String(15), nullable=True)
    advisorID = db.Column(db.Integer, nullable=True)
    progress = db.Column(db.String(15), nullable=True)

    def __init__(self, stdID, name, status, email, tel,advisorID,progress):
        self.stdID = stdID
        self.name = name
        self.status = status
        self.email = email
        self.tel = tel
        self.advisorID = advisorID
        self.progress = progress
