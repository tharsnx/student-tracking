from app import db
from datetime import datetime

class Meeting(db.Model):
    __tablename__ = 'meeting'

    id = db.Column(db.Integer, primary_key=True)
    stdID = db.Column(db.String(100), nullable=False)  # Student ID
    date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)  # Meeting date

    def __init__(self, stdID, date=None):
        self.stdID = stdID
        self.date = date if date else datetime.utcnow()  # Default to current time if not provided