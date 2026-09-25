from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, sessionmaker


# =====================================
# DATABASE SETUP
# =====================================

DATABASE_URL = "sqlite:///./feedback.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False
)

Base = declarative_base()


# =====================================
# DATABASE MODEL
# =====================================

class FeedbackDB(Base):

    __tablename__ = "feedbacks"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        nullable=False
    )

    email = Column(
        String,
        nullable=False
    )

    event = Column(
        String,
        nullable=False
    )

    rating = Column(
        Integer,
        nullable=False
    )

    feedback = Column(
        String,
        nullable=False
    )


# Create database tables
Base.metadata.create_all(bind=engine)


# =====================================
# FASTAPI APP
# =====================================

app = FastAPI(
    title="R K Events API",
    description="Event Feedback Management System API",
    version="2.0.0"
)


# =====================================
# CORS
# =====================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# =====================================
# PYDANTIC MODEL
# =====================================

class Feedback(BaseModel):

    name: str
    email: str
    event: str
    rating: int
    feedback: str


# =====================================
# HOME
# =====================================

@app.get("/")
def home():

    return {
        "message": "R K Events Backend is running!"
    }


# =====================================
# EVENTS
# =====================================

@app.get("/events")
def get_events():

    return [

        {
            "id": 1,
            "name": "Tech Conference 2026",
            "date": "25 SEP",
            "location": "New Delhi",
            "description":
                "A conference focused on technology and innovation."
        },

        {
            "id": 2,
            "name": "AI Workshop",
            "date": "28 SEP",
            "location": "Meerut",
            "description":
                "Learn the basics of Artificial Intelligence."
        },

        {
            "id": 3,
            "name": "College Fest 2026",
            "date": "02 OCT",
            "location": "Meerut",
            "description":
                "A fun college event with activities and competitions."
        }

    ]


# =====================================
# CREATE FEEDBACK
# =====================================

@app.post("/feedback")
def create_feedback(feedback: Feedback):

    db = SessionLocal()

    try:

        new_feedback = FeedbackDB(

            name=feedback.name,

            email=feedback.email,

            event=feedback.event,

            rating=feedback.rating,

            feedback=feedback.feedback

        )

        db.add(new_feedback)

        db.commit()

        db.refresh(new_feedback)

        return {

            "message":
                "Feedback submitted successfully.",

            "data": {

                "id": new_feedback.id,

                "name": new_feedback.name,

                "email": new_feedback.email,

                "event": new_feedback.event,

                "rating": new_feedback.rating,

                "feedback": new_feedback.feedback

            }

        }

    finally:

        db.close()


# =====================================
# GET ALL FEEDBACK
# =====================================

@app.get("/feedback")
def get_feedback():

    db = SessionLocal()

    try:

        feedbacks = (
            db.query(FeedbackDB)
            .all()
        )

        result = []

        for feedback in feedbacks:

            result.append({

                "id": feedback.id,

                "name": feedback.name,

                "email": feedback.email,

                "event": feedback.event,

                "rating": feedback.rating,

                "feedback": feedback.feedback

            })

        return {

            "total": len(result),

            "feedbacks": result

        }

    finally:

        db.close()


# =====================================
# DELETE ONE FEEDBACK
# =====================================

@app.delete("/feedback/{feedback_id}")
def delete_feedback(feedback_id: int):

    db = SessionLocal()

    try:

        feedback = (
            db.query(FeedbackDB)
            .filter(
                FeedbackDB.id == feedback_id
            )
            .first()
        )

        if not feedback:

            raise HTTPException(
                status_code=404,
                detail="Feedback not found."
            )

        db.delete(feedback)

        db.commit()

        return {

            "message":
                "Feedback deleted successfully."

        }

    finally:

        db.close()


# =====================================
# DELETE ALL FEEDBACK
# =====================================

@app.delete("/feedback")
def delete_all_feedback():

    db = SessionLocal()

    try:

        db.query(FeedbackDB).delete()

        db.commit()

        return {

            "message":
                "All feedback deleted successfully."

        }

    finally:

        db.close()
