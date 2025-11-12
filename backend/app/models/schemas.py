from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    text: str = Field(..., min_length=1, max_length=10000)
    current_tasks: Optional[List[dict]] = None  # Current table state with manual edits


class Task(BaseModel):
    id: str
    title: str
    duration_days: int
    owner: Optional[str] = None
    dependencies: List[str] = Field(default_factory=list)
    start_date: Optional[str] = None  # Planned start (from scheduler)
    end_date: Optional[str] = None    # Planned end (from scheduler)
    actual_start: Optional[str] = None  # Actual start (from Kanban)
    actual_end: Optional[str] = None    # Actual end (from Kanban)
    status: Optional[str] = "todo"  # todo, in-progress, done


class ChatResponse(BaseModel):
    session_id: str
    entities: dict
    message: str = "Message processed"


class GenerateReportRequest(BaseModel):
    session_id: str
    start_date: Optional[str] = None
    tasks: Optional[List[dict]] = None  # Optional: use these tasks instead of session tasks


class GenerateReportResponse(BaseModel):
    plan_id: str
    project_name: str
    tasks: List[Task]
    start_date: str
    end_date: str


class GanttItem(BaseModel):
    id: str
    content: str
    start: str
    end: str
    group: str = "Unassigned"
