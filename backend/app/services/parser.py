from typing import List, Dict, Any
from .llm_client import LLMClient


ENTITY_EXTRACTION_PROMPT = """You are an expert project planning assistant. Your job is to extract structured project information from user conversations.

CRITICAL: Return ONLY a valid JSON object. No markdown, no code blocks, no explanations - just the raw JSON.

Required JSON structure:
{
  "project_name": "extracted project name or null",
  "tasks": [
    {
      "id": "task_1",
      "title": "clear task description",
      "duration_days": 5,
      "owner": "person name or null",
      "dependencies": ["task_id"]
    }
  ]
}

EXTRACTION RULES:

1. PROJECT NAME:
   - Extract the main project/product name if mentioned
   - Examples: "website", "mobile app", "e-commerce platform"
   - Set to null if not clearly stated

2. TASK IDs:
   - Generate sequential IDs: "task_1", "task_2", "task_3", etc.
   - NEVER reuse IDs
   - Keep IDs simple and sequential

3. TASK TITLES:
   - Be clear and descriptive
   - Include the main action and deliverable
   - Examples: "Design user interface", "Develop authentication system", "Deploy to production"

4. DURATION (duration_days):
   - MUST be a positive integer (1 or greater)
   - If explicitly stated: use that number
   - If not stated: estimate based on task complexity:
     * Simple tasks (design mockup, write docs): 2-3 days
     * Medium tasks (develop feature, testing): 5-7 days
     * Complex tasks (full system, integration): 10-15 days
   - Default to 5 days if uncertain

5. OWNER:
   - Extract person's name if mentioned (e.g., "Alice", "Bob", "John")
   - Extract role if mentioned (e.g., "Designer", "Developer", "QA Team")
   - Set to null if not mentioned
   - Keep names/roles as stated by user

6. DEPENDENCIES:
   - Array of task IDs that must complete before this task
   - Look for keywords: "after", "depends on", "once", "following", "needs"
   - Examples:
     * "develop frontend after design" → frontend depends on design
     * "testing needs development done" → testing depends on development
   - Empty array [] if no dependencies

EXAMPLES:

Input: "Build a website with design (3 days, Alice) and development (7 days, Bob, after design)"
Output:
{
  "project_name": "website",
  "tasks": [
    {
      "id": "task_1",
      "title": "Design",
      "duration_days": 3,
      "owner": "Alice",
      "dependencies": []
    },
    {
      "id": "task_2",
      "title": "Development",
      "duration_days": 7,
      "owner": "Bob",
      "dependencies": ["task_1"]
    }
  ]
}

Input: "Create mobile app: planning, design, coding, and testing"
Output:
{
  "project_name": "mobile app",
  "tasks": [
    {
      "id": "task_1",
      "title": "Planning",
      "duration_days": 3,
      "owner": null,
      "dependencies": []
    },
    {
      "id": "task_2",
      "title": "Design",
      "duration_days": 5,
      "owner": null,
      "dependencies": ["task_1"]
    },
    {
      "id": "task_3",
      "title": "Coding",
      "duration_days": 10,
      "owner": null,
      "dependencies": ["task_2"]
    },
    {
      "id": "task_4",
      "title": "Testing",
      "duration_days": 5,
      "owner": null,
      "dependencies": ["task_3"]
    }
  ]
}

IMPORTANT:
- Return ONLY the JSON object
- No markdown formatting (no ```json or ```)
- No explanatory text before or after
- Ensure valid JSON syntax
- All string values in quotes
- All numeric values without quotes"""


async def extract_entities_from_messages(messages: List[Dict[str, str]]) -> Dict[str, Any]:
    """
    Use LLM to extract project entities from conversation messages.
    """
    llm = LLMClient()
    
    try:
        result = await llm.extract_json(messages, ENTITY_EXTRACTION_PROMPT)
        
        # Validate structure
        if "tasks" not in result:
            result["tasks"] = []
        if "project_name" not in result:
            result["project_name"] = "Untitled Project"
        
        return result
    finally:
        await llm.close()


def merge_entities(existing: Dict[str, Any], new: Dict[str, Any]) -> Dict[str, Any]:
    """
    Merge new entities with existing ones, updating or adding tasks.
    """
    merged = existing.copy()
    
    # Update project name if provided
    if new.get("project_name"):
        merged["project_name"] = new["project_name"]
    
    # Merge tasks
    existing_tasks = {task["id"]: task for task in merged.get("tasks", [])}
    
    for new_task in new.get("tasks", []):
        task_id = new_task["id"]
        if task_id in existing_tasks:
            # Update existing task
            existing_tasks[task_id].update(new_task)
        else:
            # Add new task
            existing_tasks[task_id] = new_task
    
    merged["tasks"] = list(existing_tasks.values())
    
    return merged
