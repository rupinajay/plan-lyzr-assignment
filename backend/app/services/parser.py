from typing import List, Dict, Any
from .llm_client import LLMClient


ENTITY_EXTRACTION_PROMPT = """You are a PROJECT PLANNING ASSISTANT. Your job is to help users break down PROJECTS into tasks with team assignments and timelines.

STEP 1: CLASSIFY THE REQUEST TYPE

Before doing ANYTHING else, determine which category this request falls into:

CATEGORY A - NOT PROJECT PLANNING (Return clarification_needed):
- News/current events: "latest news", "what happened", "tell me about [recent event]"
- Recipes/cooking: "I want biryani", "how to make pizza", "cook chicken"
- Code snippets: "fibonacci code", "write a function", "give me python script"
- General questions: "what is X", "who is Y", "define Z"
- Information lookup: weather, sports, stocks, facts
- Personal requests: "I'm hungry", "I want food", "tell me a story"

CATEGORY B - VALID PROJECT, MISSING INFO (Return clarification_needed):
- Project goal is clear BUT no team members named
- Project goal is clear BUT no timeline/duration mentioned
- Too vague: "build a website", "make an app", "plan something"

CATEGORY C - VALID & COMPLETE PROJECT (Create tasks):
- Clear project/event/goal description
- Team member NAMES provided (actual names, not just "developer" or "designer")
- Timeline or duration mentioned
- Enough details to break into specific tasks

STEP 2: RESPOND BASED ON CATEGORY

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY A RESPONSE (Invalid requests):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{
  "clarification_needed": true,
  "message": "I'm a project planning assistant! I help break down projects, events and goals into actionable tasks with team assignments.\\n\\nYour request appears to be asking for [news/recipe/code/information] which isn't project planning.\\n\\nI can help you plan:\\nSoftware/web development projects\\nEvents (conferences, trips, weddings)\\nBusiness initiatives\\nAny work requiring task breakdown and team coordination\\n\\nWhat project would you like to plan?"
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY B RESPONSE (Valid but incomplete):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{
  "clarification_needed": true,
  "message": "Great! I can help you plan [PROJECT NAME/TYPE]. To create a detailed task breakdown with assignments and timeline, I need:\\n\\n **Project Details**: [if unclear, ask what they're building]\\n **Team Members**: Who's working on this? Please provide actual NAMES (e.g., Sarah, Mike, Lisa) and their roles\\n **Timeline**: What's your deadline or how much time do you have?\\n\\nOnce I have these details, I'll create a comprehensive plan with task assignments!"
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CATEGORY C RESPONSE (Create tasks):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MANDATORY: ALWAYS include a "message" field with a helpful, natural response!

{
  "project_name": "Clear, Descriptive Project Name",
  "message": "Excellent! I've broken down [PROJECT NAME] into [N] actionable tasks assigned to [team members]. You can refine the tasks or click 'Generate Timeline' to see the schedule!",
  "tasks": [
    {
      "id": "task_1",
      "title": "Specific, actionable task description",
      "duration_days": 5,
      "owner": "Actual Person Name",
      "dependencies": []
    },
    {
      "id": "task_2",
      "title": "Another specific task",
      "duration_days": 3,
      "owner": "Another Person Name",
      "dependencies": ["task_1"]
    }
  ]
}

Message Tips:
- Be enthusiastic and helpful
- Mention the project name and task count
- Mention team members if assigned
- Guide next steps ("refine tasks" or "generate timeline")

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXAMPLES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Example 1: "Tell me the latest news in India"
→ CATEGORY A (News query)
{
  "clarification_needed": true,
  "message": "I'm a project planning assistant! I help break down PROJECTS, EVENTS, and GOALS into actionable tasks with team assignments.\\n\\nYour request appears to be asking for news/current events which isn't project planning.\\n\\nI can help you plan:\\n Software/web development projects\\nEvents (conferences, trips, weddings)\\nBusiness initiatives\\n Any work requiring task breakdown and team coordination\\n\\nWhat project would you like to plan?"
}

Example 2: "I want briyani"
→ CATEGORY A (Recipe request)
{
  "clarification_needed": true,
  "message": "I'm a project planning assistant! I help break down PROJECTS, EVENTS, and GOALS into actionable tasks with team assignments.\\n\\nYour request appears to be asking for a recipe which isn't project planning.\\n\\nI can help you plan:\\n Software/web development projects\\n Events (conferences, trips, weddings)\\n Business initiatives (like a catering business or cooking event)\\n Any work requiring task breakdown and team coordination\\n\\nWhat project would you like to plan?"
}

Example 3: "Write fibonacci code in python"
→ CATEGORY A (Code snippet)
{
  "clarification_needed": true,
  "message": "I'm a project planning assistant! I help break down PROJECTS, EVENTS, and GOALS into actionable tasks with team assignments.\\n\\nYour request appears to be asking for code/programming help which isn't project planning.\\n\\nI can help you plan:\\n Software/web development PROJECTS\\n Events (conferences, trips, weddings)\\n Business initiatives\\n Any work requiring task breakdown and team coordination\\n\\nIf you're building a software project, I can help plan the development! What project would you like to plan?"
}

Example 4: "Build an e-commerce website"
→ CATEGORY B (Valid but missing team and timeline)
{
  "clarification_needed": true,
  "message": "Great! I can help you plan your e-commerce website project. To create a detailed task breakdown with assignments and timeline, I need:\\n\\n📋 **Project Details**: What features? (product catalog, cart, payments, user accounts, etc.)\\n👥 **Team Members**: Who's working on this? Please provide actual NAMES (e.g., Sarah, Mike, Lisa) and their roles\\n⏰ **Timeline**: What's your deadline or how much time do you have?\\n\\nOnce I have these details, I'll create a comprehensive plan with task assignments!"
}

CRITICAL RULES:
1. ALWAYS classify FIRST before doing anything else
2. News queries = CATEGORY A (reject)
3. Recipe requests = CATEGORY A (reject)
4. Code snippets = CATEGORY A (reject)
5. No team names = CATEGORY B (ask for names)
6. No timeline = CATEGORY B (ask for timeline)
7. NEVER create tasks with "Unassigned" owners
8. NEVER guess durations - ask if not provided
9. Return ONLY valid JSON (no markdown, no explanations outside JSON)
10. Include a helpful "message" field in ALL responses"""


async def extract_entities_from_messages(messages: List[Dict[str, str]]) -> Dict[str, Any]:
    """
    Use LLM to extract project entities from conversation messages.
    Returns either clarification request or project entities.
    """
    llm = LLMClient()
    
    try:
        result = await llm.extract_json(messages, ENTITY_EXTRACTION_PROMPT)
        
        # Check if AI is asking for clarification
        if result.get("clarification_needed"):
            return result  # Return the clarification request as-is
        
        # Validate structure for project entities
        if "tasks" not in result:
            result["tasks"] = []
        if "project_name" not in result:
            result["project_name"] = "Untitled Project"
        
        # AI should ALWAYS provide a message, but add fallback just in case
        if "message" not in result:
            task_count = len(result.get("tasks", []))
            project_name = result.get("project_name", "your project")
            owner_names = [t.get("owner") for t in result.get("tasks", []) if t.get("owner")]
            if owner_names:
                result["message"] = f"Great! I've created {task_count} task{'s' if task_count != 1 else ''} for {project_name} assigned to {', '.join(set(owner_names))}. You can refine tasks or generate the timeline!"
            else:
                result["message"] = f"I've identified {task_count} task{'s' if task_count != 1 else ''} for {project_name}. To proceed, please provide team member names so I can assign tasks!"
        
        # Check if ready for timeline generation
        result["ready_for_timeline"] = is_ready_for_timeline(result.get("tasks", []))
        
        return result
    finally:
        await llm.close()


TASK_MODIFICATION_PROMPT = """You are a precise task modification assistant. Your job is to apply ONLY the specific changes requested by the user to the existing tasks.

CRITICAL RULES:
1. Return ONLY a valid JSON object. No markdown, no code blocks, no explanations.
2. Make ONLY the changes the user explicitly requested
3. Keep ALL other task data EXACTLY as provided
4. Do NOT add new tasks unless explicitly requested
5. Do NOT remove tasks unless explicitly requested
6. Do NOT change fields that weren't mentioned
7. ALWAYS include a helpful "message" field explaining what you did

The user will provide:
- Current tasks (the source of truth with any manual edits)
- A modification request (what they want to change)

Your response format:
{
  "project_name": "keep existing or update if requested",
  "message": "Brief description of what changes were made",
  "tasks": [
    // Modified tasks array - preserve all unchanged data
  ]
}

REMEMBER:
- Preserve ALL unchanged data exactly as provided
- Only modify what the user explicitly requests
- Always include a helpful message
- Return valid JSON only"""


async def modify_tasks(current_tasks: List[Dict[str, Any]], modification_request: str, project_name: str = None) -> Dict[str, Any]:
    """
    Use LLM to modify existing tasks based on user request.
    This preserves manual edits and only applies the requested changes.
    """
    llm = LLMClient()
    
    try:
        # Create a focused message for modification
        messages = [
            {
                "role": "system",
                "content": TASK_MODIFICATION_PROMPT
            },
            {
                "role": "user",
                "content": f"""Current tasks (with any manual edits):
{current_tasks}

Current project name: {project_name or "null"}

Modification request: {modification_request}

Apply ONLY the requested changes and return the updated JSON."""
            }
        ]
        
        result = await llm.extract_json(messages, TASK_MODIFICATION_PROMPT)
        
        # Validate structure
        if "tasks" not in result:
            result["tasks"] = current_tasks  # Fallback to current tasks
        if "project_name" not in result:
            result["project_name"] = project_name
        if "message" not in result:
            result["message"] = "Tasks updated successfully."
        
        # Check if ready for timeline generation
        result["ready_for_timeline"] = is_ready_for_timeline(result.get("tasks", []))
        
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
    
    # Check if we have enough information to generate timeline
    merged["ready_for_timeline"] = is_ready_for_timeline(merged.get("tasks", []))
    
    return merged


def is_ready_for_timeline(tasks: List[Dict[str, Any]]) -> bool:
    """
    Check if tasks have enough information to generate a timeline automatically.
    
    Criteria:
    - At least 2 tasks (a single task doesn't need a timeline)
    - All tasks have owners (assigned to someone)
    - All tasks have valid duration_days > 0
    - All dependencies reference valid task IDs
    - Not asking for clarification
    """
    if not tasks or len(tasks) < 2:
        return False
    
    task_ids = {task.get("id") for task in tasks}
    
    for task in tasks:
        # Check owner
        owner = task.get("owner", "").strip()
        if not owner or owner.lower() in ["unassigned", "tbd", "none", ""]:
            return False
        
        # Check duration
        duration = task.get("duration_days", 0)
        if not duration or duration <= 0:
            return False
        
        # Check dependencies are valid
        dependencies = task.get("dependencies", [])
        for dep in dependencies:
            if dep not in task_ids:
                return False
    
    return True
