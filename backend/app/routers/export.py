from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from typing import List
import csv
import io
from ..models.schemas import GanttItem
from ..storage import get_plan

router = APIRouter(prefix="/api", tags=["export"])


@router.get("/gantt_data/{plan_id}", response_model=List[GanttItem])
async def get_gantt_data(plan_id: str):
    """
    Return timeline items suitable for Gantt chart rendering.
    """
    plan = get_plan(plan_id)
    
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    gantt_items = []
    
    for task in plan.tasks:
        gantt_items.append(GanttItem(
            id=task.id,
            content=task.title,
            start=task.start_date,
            end=task.end_date,
            group=task.owner or "Unassigned"
        ))
    
    return gantt_items


@router.get("/report/{plan_id}")
async def get_report(plan_id: str):
    """
    Get full report/plan by ID.
    """
    plan = get_plan(plan_id)
    
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    return plan.to_dict()


@router.get("/report/{plan_id}/csv")
async def export_csv(plan_id: str):
    """
    Export plan as CSV file.
    """
    plan = get_plan(plan_id)
    
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow(["Task ID", "Title", "Duration (days)", "Owner", "Start Date", "End Date", "Dependencies"])
    
    # Write tasks
    for task in plan.tasks:
        writer.writerow([
            task.id,
            task.title,
            task.duration_days,
            task.owner or "",
            task.start_date or "",
            task.end_date or "",
            ", ".join(task.dependencies)
        ])
    
    # Return CSV response
    csv_content = output.getvalue()
    output.close()
    
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=plan_{plan_id}.csv"}
    )
