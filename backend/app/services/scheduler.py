from datetime import datetime, timedelta
from typing import List, Dict
from ..models.schemas import Task


def is_weekend(date: datetime) -> bool:
    """Check if date is a weekend (Saturday=5, Sunday=6)"""
    return date.weekday() >= 5


def add_business_days(start_date: datetime, days: int) -> datetime:
    """Add business days to a date, skipping weekends"""
    current = start_date
    days_added = 0
    
    while days_added < days:
        current += timedelta(days=1)
        if not is_weekend(current):
            days_added += 1
    
    return current


def schedule_tasks(tasks: List[Task], start_date: str) -> List[Task]:
    """
    Schedule tasks with dependencies, skipping weekends.
    Returns tasks with start_date and end_date populated.
    """
    start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00')) if 'T' in start_date else datetime.strptime(start_date, "%Y-%m-%d")
    
    # Skip to next business day if start is weekend
    while is_weekend(start_dt):
        start_dt += timedelta(days=1)
    
    # Build dependency map
    task_map = {task.id: task for task in tasks}
    task_end_dates: Dict[str, datetime] = {}
    
    def schedule_task(task: Task) -> datetime:
        """Recursively schedule a task and its dependencies"""
        if task.id in task_end_dates:
            return task_end_dates[task.id]
        
        # Find latest end date of dependencies
        latest_dep_end = start_dt
        for dep_id in task.dependencies:
            if dep_id in task_map:
                dep_end = schedule_task(task_map[dep_id])
                if dep_end > latest_dep_end:
                    latest_dep_end = dep_end
        
        # Start after dependencies, skip to next business day if needed
        task_start = latest_dep_end
        while is_weekend(task_start):
            task_start += timedelta(days=1)
        
        # Calculate end date
        task_end = add_business_days(task_start, task.duration_days)
        
        # Update task
        task.start_date = task_start.strftime("%Y-%m-%d")
        task.end_date = task_end.strftime("%Y-%m-%d")
        
        task_end_dates[task.id] = task_end
        return task_end
    
    # Schedule all tasks
    for task in tasks:
        schedule_task(task)
    
    return tasks
