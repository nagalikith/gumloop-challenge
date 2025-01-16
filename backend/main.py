from fastapi import FastAPI, HTTPException
from sqlalchemy import create_engine, Column, Integer, String, JSON, Boolean, DateTime, func
from sqlalchemy.dialects.postgresql import JSONB
from pydantic import BaseModel, Field
from sqlalchemy.ext.declarative import declarative_base
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import sessionmaker
from typing import List, Dict, Optional
import networkx as nx
from datetime import datetime
from passlib.context import CryptContext


app = FastAPI()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# PostgreSQL Database setup
DATABASE_URL = "postgresql://postgres:password@localhost:5432/rvs-ai-auth"  # Update with your credentials
engine = create_engine(DATABASE_URL)
Base = declarative_base()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Database Models
class GraphConfiguration(Base):
    __tablename__ = "graph_configurations"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    is_acyclic = Column(Boolean, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.current_timestamp(),
        nullable=False
    )
    configuration = Column(JSONB, nullable=False)

class UserProfile(Base):
    __tablename__ = "user_profiles"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    address = Column(String)
    about = Column(String)
    birthdate = Column(DateTime(timezone=True))
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.current_timestamp(),
        nullable=False
    )
    updated_at = Column(
        DateTime, 
        default=datetime.utcnow, 
        onupdate=datetime.utcnow)

Base.metadata.create_all(bind=engine)

class UserProfileInput(BaseModel):
    email: str
    password: str
    address: str | None = None
    about: str | None = None
    birthdate: str | None = None

@app.post("/register/")
def register_user(user_data: UserProfileInput):
    """
    Create a new user account with profile information or login if user exists.
    """
    try:
        db = SessionLocal()
        
        # Check if user already exists
        existing_user = db.query(UserProfile).filter(UserProfile.email == user_data.email).first()
        
        if existing_user:
            # If user exists, verify password and return user data
            if pwd_context.verify(user_data.password, existing_user.password):
                return {
                    "message": "User logged in successfully",
                    "user_id": existing_user.id,
                    "email": existing_user.email,
                    "address": existing_user.address,
                    "about": existing_user.about,
                    "birthdate": existing_user.birthdate,
                    "created_at": existing_user.created_at
                }
            else:
                raise HTTPException(
                    status_code=401,
                    detail="Incorrect password for existing account"
                )

        # If user doesn't exist, create new user
        hashed_password = pwd_context.hash(user_data.password)
        new_user = UserProfile(
            email=user_data.email,
            password=hashed_password,
            address=user_data.address,
            about=user_data.about,
            birthdate=user_data.birthdate,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return {
            "message": "User registered successfully",
            "user_id": new_user.id,
            "email": new_user.email,
            "address": new_user.address,
            "about": new_user.about,
            "birthdate": new_user.birthdate,
            "created_at": new_user.created_at
        }

    except HTTPException as he:
        db.rollback()
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error registering user: {str(e)}"
        )
    finally:
        db.close()

@app.post("/login/update-profile/")
def login_and_update_profile(user_data: UserProfileInput):
    """
    Login and optionally update user profile information.
    """
    try:
        db = SessionLocal()
        existing_user = db.query(UserProfile).filter(UserProfile.email == user_data.email).first()

        if not existing_user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        # Verify password
        if not pwd_context.verify(user_data.password, existing_user.password):
            raise HTTPException(
                status_code=401,
                detail="Incorrect password"
            )

        # Update profile if new data provided
        profile_updated = False
        if user_data.address:
            existing_user.address = user_data.address
            profile_updated = True
        if user_data.about:
            existing_user.about = user_data.about
            profile_updated = True
        if user_data.birthdate:
            existing_user.birthdate = user_data.birthdate
            profile_updated = True

        if profile_updated:
            existing_user.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(existing_user)
            message = "Login successful and profile updated"
        else:
            message = "Login successful"

        return {
            "message": message,
            "user_id": existing_user.id,
            "updated_at": existing_user.updated_at
        }

    except HTTPException as he:
        db.rollback()
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error processing request: {str(e)}"
        )
    finally:
        db.close()

@app.post("/save-config/")
def validate_and_store_graph(graph_input: dict):
    """
    Validate if all nodes are unique, check if the graph is cyclic,
    and store the configuration in the PostgreSQL database.
    """
    print(graph_input)
    nodes = graph_input["configuration"]["nodes"]
    edges = graph_input["configuration"]["edges"]

    # Validate if all nodes are unique
    if len(set(node["id"] for node in nodes)) != len(nodes):
        raise HTTPException(status_code=400, detail="Graph nodes are not unique.")

    # Create a directed graph
    graph = nx.DiGraph()
    graph.add_nodes_from(node["id"] for node in nodes)
    graph.add_edges_from((edge["source"], edge["target"]) for edge in edges)

    # Check if the graph is cyclic
    is_acyclic = nx.is_directed_acyclic_graph(graph)

    # Store configuration in the database
    db = SessionLocal()
    try:
        db_graph = GraphConfiguration(
            name=graph_input["name"],
            is_acyclic=is_acyclic,
            configuration=graph_input["configuration"],  # Store the cleaned configuration directly
        )
        db.add(db_graph)
        db.commit()
        db.refresh(db_graph)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Error storing graph configuration: {str(e)}"
        )
    finally:
        db.close()

    return {"message": "Graph configuration validated and stored successfully."}

@app.get("/get-config/")
def get_latest_configuration():
    """
    Retrieve the latest stored graph configuration.
    """
    db = SessionLocal()
    try:
        latest_config = db.query(GraphConfiguration)\
            .order_by(GraphConfiguration.created_at.desc())\
            .first()
        
        if not latest_config:
            raise HTTPException(status_code=404, detail="No configurations found")
            
        return {
            "id": latest_config.id,
            "name": latest_config.name,
            "is_acyclic": latest_config.is_acyclic,
            "created_at": latest_config.created_at,
            "configuration": latest_config.configuration,
        }
    finally:
        db.close()

@app.get("/data/")
def get_all_users():
    """
    Retrieve all user information from the database.
    """
    try:
        # Query for all user profiles
        db = SessionLocal()
        users = db.query(UserProfile).all()

        if not users:
            raise HTTPException(
                status_code=404,
                detail="No users found in the database."
            )

        return [
            {
                "user_id": user.id,
                "email": user.email,
                "address": user.address,
                "about": user.about,
                "birthdate": user.birthdate,
                "created_at": user.created_at,
                "updated_at": user.updated_at
            }
            for user in users
        ]

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving user data: {str(e)}"
        )
    finally:
        db.close()