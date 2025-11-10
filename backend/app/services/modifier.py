from typing import List, Dict, Any
from .llm_client import LLMClient


TASK_MODIFICATION_PROMPT = """You are a project planning assistant. The user has an existing project with tasks and wants to make specific modifications.

CRITICAL: Return ONLY a valid JSON object describing the CHANGES to make. No markdown, no code blocks.

Your job is to:
1. Understand what the user wants to change
2. Return ONLY the modifications needed
3. Do NOT re-extract all tasks, only specify changes

JSON structure for modifications:
{
  "action": "add" | "update" | "delete" | "none",
  "modifications": [
    {
      "task_id": "task_id_to_modify or null for new tasks",
      "changes": {
        "title": "new title if changed",
        "duration_days": new_duration_if_changed,
        "owner": "new owner if changed",
        "dependencies": ["new", "dependencies", "if", "changed"]
      }
    }
  ],
  "new_tasks": [
    {
      "title": "new task title",
      "duration_days": 5,
      "owner": "person name or null",
      "dependencies": []
    }
  ]
}

EXAMPLES:

Current tasks:
[
  {"id": "task_1", "title": "Design UI", "duration_days": 5, "owner": "Alice"},
  {"id": "task_2", "title": "Develop frontend", "duration_days": 10, "owner": "Bob"}
]

User: "Change the design duration to 3 days"
Output:
{
  "action": "update",
  "modifications": [
    {
      "task_id": "task_1",
      "changes": {
        "duration_days": 3
      }
    }
  ],
  "new_tasks": []
}

User: "Add a testing phase for 5 days after development"
Output:
{
  "action": "add",
  "modifications": [],
  "new_tasks": [
    {
      "title": "Testing phase",
      "duration_days": 5,
      "owner": null,
      "dependencies": ["task_2"]
    }
  ]
}

User: "Assign Alice to the frontend task"
Output:
{
  "action": "update",
  "modifications": [
    {
      "task_id": "task_2",
      "changes": {
        "owner": "Alice"
      }
    }
  ],
  "new_tasks": []
}

IMPORTANT:
- Return ONLY the JSON object
- Only include fields that are being changed
- Do NOT return unchanged tasks
- Be precise about what to modify"""


async def modify_tasks(current_tasks: List[Dict], user_request: str) -> Dict[str, Any]:
    """
    Use LLM to determine what modifications to make to existing tasks.
    """
    llm = LLMClient()
    
    # Build context message
    context = f"""Current tasks:
{current_tasks}

User request: {user_request}"""
    
    messages = [{"role": "user", "content": context}]
    
    try:
        result = await llm.extract_json(messages, TASK_MODIFICATION_PROMPT)
        
        # Validate structure
        if "action" not in result:
            result["action"] = "none"
        if "modifications" not in result:
            result["modifications"] = []
        if "new_tasks" not in result:
            result["new_tasks"] = []
        
        return result
    finally:
        await llm.close()


def apply_modifications(current_tasks: List[Dict], modifications: Dict[str, Any]) -> List[Dict]:
    """
    Apply modifications to the current task list.
    """
    tasks = [task.copy() for task in current_tasks]
    
    # Apply updates
    for mod in modifications.get("modifications", []):
        task_id = mod.get("task_id")
        changes = mod.get("changes", {})
        
        for task in tasks:
            if task["id"] == task_id:
                task.update(changes)
                break
    
    # Add new tasks
    for new_task in modifications.get("new_tasks", []):
        # Generate new task ID
        max_id = max([int(t["id"].split("_")[1]) for t in tasks if "_" in t["id"]], default=0)
        new_task["id"] = f"task_{max_id + 1}"
        tasks.append(new_task)
    
    return tasks
