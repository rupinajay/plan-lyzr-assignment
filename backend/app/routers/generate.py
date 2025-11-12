from fastapi import APIRouter, HTTPException
from datetime import datetime
import uuid
from ..models.schemas import GenerateReportRequest, GenerateReportResponse, Task
from ..storage import get_session, store_plan, Plan
from ..services.scheduler import schedule_tasks

router = APIRouter(prefix="/api", tags=["generate"])


@router.post("/generate_report", response_model=GenerateReportResponse)
async def generate_report(request: GenerateReportRequest):
    """
    Finalize plan, schedule tasks with dependencies, and return structured report.
    If tasks are provided in the request, use those (edited tasks from frontend).
    Otherwise, use tasks from the session.
    """
    try:
        # Get session
        session = get_session(request.session_id)
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Use provided tasks if available (edited tasks), otherwise use session tasks
        if request.tasks:
            # Use the edited tasks from the frontend
            tasks_data = request.tasks
            project_name = session.entities.get("project_name") or "Untitled Project"
        else:
            # Use original tasks from session
            entities = session.entities
            if not entities.get("tasks"):
                raise HTTPException(status_code=400, detail="No tasks found in session")
            tasks_data = entities["tasks"]
            project_name = entities.get("project_name") or "Untitled Project"
        
        # Convert to Task objects
        tasks = [Task(**task) for task in tasks_data]
        
        # Determine start date
        start_date = request.start_date or datetime.utcnow().strftime("%Y-%m-%d")
        
        # Schedule tasks
        scheduled_tasks = schedule_tasks(tasks, start_date)
        
        # Find overall end date
        end_dates = [datetime.strptime(task.end_date, "%Y-%m-%d") for task in scheduled_tasks if task.end_date]
        end_date = max(end_dates).strftime("%Y-%m-%d") if end_dates else start_date
        
        # Create and store plan
        plan_id = str(uuid.uuid4())
        
        plan = Plan(
            plan_id=plan_id,
            project_name=project_name,
            tasks=scheduled_tasks,
            start_date=start_date,
            end_date=end_date
        )
        
        store_plan(plan)
        
        return GenerateReportResponse(
            plan_id=plan_id,
            project_name=project_name,
            tasks=scheduled_tasks,
            start_date=start_date,
            end_date=end_date
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating report: {str(e)}")
