import uuid
from typing import Dict, List, Optional
from datetime import datetime


class Session:
    """In-memory session storage for MVP"""
    
    def __init__(self, session_id: str):
        self.id = session_id
        self.messages: List[Dict[str, str]] = []
        self.entities: Dict = {"project_name": None, "tasks": []}
        self.created_at = datetime.utcnow()
    
    def append_message(self, text: str, role: str = "user"):
        """Add a message to the session"""
        self.messages.append({"role": role, "content": text})
    
    def update_entities(self, entities: Dict):
        """Update extracted entities"""
        self.entities = entities
    
    def to_dict(self):
        """Convert session to dictionary"""
        return {
            "id": self.id,
            "messages": self.messages,
            "entities": self.entities,
            "created_at": self.created_at.isoformat()
        }


class Plan:
    """Stored plan/report"""
    
    def __init__(self, plan_id: str, project_name: str, tasks: List, start_date: str, end_date: str):
        self.id = plan_id
        self.project_name = project_name
        self.tasks = tasks
        self.start_date = start_date
        self.end_date = end_date
        self.created_at = datetime.utcnow()
    
    def to_dict(self):
        """Convert plan to dictionary"""
        return {
            "plan_id": self.id,
            "project_name": self.project_name,
            "tasks": [task.dict() if hasattr(task, 'dict') else task for task in self.tasks],
            "start_date": self.start_date,
            "end_date": self.end_date,
            "created_at": self.created_at.isoformat()
        }


# In-memory storage (replace with Redis/DB for production)
_sessions: Dict[str, Session] = {}
_plans: Dict[str, Plan] = {}


def get_session(session_id: Optional[str] = None) -> Session:
    """Get or create a session"""
    if session_id and session_id in _sessions:
        return _sessions[session_id]
    
    new_id = session_id or str(uuid.uuid4())
    session = Session(new_id)
    _sessions[new_id] = session
    return session


def store_plan(plan: Plan) -> str:
    """Store a plan and return its ID"""
    _plans[plan.id] = plan
    return plan.id


def get_plan(plan_id: str) -> Optional[Plan]:
    """Retrieve a plan by ID"""
    return _plans.get(plan_id)


def list_sessions() -> List[str]:
    """List all session IDs"""
    return list(_sessions.keys())


def list_plans() -> List[str]:
    """List all plan IDs"""
    return list(_plans.keys())
