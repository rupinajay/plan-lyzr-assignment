from typing import List, Dict, Any
from .llm_client import LLMClient


ENTITY_EXTRACTION_PROMPT = """You are an expert project planning assistant with deep knowledge across multiple domains. Your job is to extract structured, meaningful project information from user conversations.

CRITICAL: Return ONLY a valid JSON object. No markdown, no code blocks, no explanations - just the raw JSON.

Required JSON structure:
{
  "project_name": "extracted project name or null",
  "tasks": [
    {
      "id": "task_1",
      "title": "clear, specific, actionable task description",
      "duration_days": 5,
      "owner": "person name or null",
      "dependencies": ["task_id"]
    }
  ]
}

CORE INTELLIGENCE RULES:

1. UNDERSTAND CONTEXT:
   - Analyze what the user is actually trying to accomplish
   - For trips: extract specific activities, locations, and experiences
   - For projects: extract concrete deliverables and milestones
   - For events: extract preparation steps and execution tasks
   - Be SPECIFIC and ACTIONABLE, not generic

2. PROJECT NAME:
   - Extract the main goal/project name
   - Examples: "Goa Trip Dec 2024", "E-commerce Website", "Product Launch"
   - Make it descriptive and specific

3. TASK EXTRACTION - BE INTELLIGENT:
   
   For TRAVEL/TRIPS:
   - Extract specific destinations, activities, and experiences
   - Include actual place names and attractions
   - Consider timing (morning/afternoon/evening activities)
   - Example: "Visit Baga Beach and water sports" NOT "Plan itinerary for Day 1"
   
   For SOFTWARE PROJECTS:
   - Extract specific features and components
   - Include technology decisions
   - Break down into concrete deliverables
   - Example: "Implement user authentication with JWT" NOT "Backend development"
   
   For EVENTS:
   - Extract specific preparation tasks
   - Include vendor coordination, logistics
   - Example: "Book venue and catering for 50 people" NOT "Event planning"
   
   For BUSINESS:
   - Extract specific business activities
   - Include market research, customer outreach
   - Example: "Conduct customer interviews with 20 target users" NOT "Market research"

4. TASK TITLES - MUST BE SPECIFIC:
   - Include WHO, WHAT, WHERE when relevant
   - Use action verbs: Visit, Explore, Develop, Design, Book, Coordinate
   - Include key details: locations, numbers, technologies
   - BAD: "Day 1 activities"
   - GOOD: "Explore Old Goa churches and Fort Aguada"

5. DURATION (duration_days):
   - MUST be a positive integer
   - For trips: typically 1 day per activity/location
   - For development: 2-15 days based on complexity
   - For events: based on preparation time needed
   - Be realistic and practical

6. DEPENDENCIES:
   - Logical sequence of tasks
   - For trips: usually sequential by day
   - For projects: technical dependencies
   - Use task IDs: ["task_1", "task_2"]

EXAMPLES:

Input: "I'm planning a trip to Goa from Dec 1-6. I want to visit beaches, try water sports, explore old churches, and enjoy nightlife."
Output:
{
  "project_name": "Goa Trip Dec 1-6",
  "tasks": [
    {
      "id": "task_1",
      "title": "Explore North Goa beaches - Baga, Calangute, and Anjuna",
      "duration_days": 1,
      "owner": null,
      "dependencies": []
    },
    {
      "id": "task_2",
      "title": "Water sports at Baga Beach - parasailing, jet skiing, banana boat",
      "duration_days": 1,
      "owner": null,
      "dependencies": []
    },
    {
      "id": "task_3",
      "title": "Visit Old Goa churches - Basilica of Bom Jesus, Se Cathedral",
      "duration_days": 1,
      "owner": null,
      "dependencies": []
    },
    {
      "id": "task_4",
      "title": "Explore Fort Aguada and Chapora Fort for sunset views",
      "duration_days": 1,
      "owner": null,
      "dependencies": []
    },
    {
      "id": "task_5",
      "title": "Experience nightlife at Tito's Lane and Club Cubana",
      "duration_days": 1,
      "owner": null,
      "dependencies": []
    },
    {
      "id": "task_6",
      "title": "South Goa relaxation - Palolem Beach and Cabo de Rama Fort",
      "duration_days": 1,
      "owner": null,
      "dependencies": []
    }
  ]
}

Input: "Build an e-commerce website with user auth, product catalog, shopping cart, and payment integration"
Output:
{
  "project_name": "E-commerce Website",
  "tasks": [
    {
      "id": "task_1",
      "title": "Design UI/UX mockups for homepage, product pages, and checkout flow",
      "duration_days": 5,
      "owner": null,
      "dependencies": []
    },
    {
      "id": "task_2",
      "title": "Implement user authentication system with JWT and OAuth",
      "duration_days": 4,
      "owner": null,
      "dependencies": []
    },
    {
      "id": "task_3",
      "title": "Build product catalog with search, filters, and pagination",
      "duration_days": 7,
      "owner": null,
      "dependencies": ["task_1"]
    },
    {
      "id": "task_4",
      "title": "Develop shopping cart with add/remove items and quantity management",
      "duration_days": 5,
      "owner": null,
      "dependencies": ["task_3"]
    },
    {
      "id": "task_5",
      "title": "Integrate Stripe payment gateway for checkout process",
      "duration_days": 6,
      "owner": null,
      "dependencies": ["task_4"]
    },
    {
      "id": "task_6",
      "title": "End-to-end testing of complete purchase flow",
      "duration_days": 4,
      "owner": null,
      "dependencies": ["task_5"]
    }
  ]
}

IMPORTANT:
- Be SPECIFIC and DETAILED in task titles
- Use your knowledge to suggest relevant activities/tasks
- Think about what the user actually needs to accomplish
- Return ONLY the JSON object
- No markdown formatting
- Ensure valid JSON syntax"""


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


TASK_MODIFICATION_PROMPT = """You are a precise task modification assistant. Your job is to apply ONLY the specific changes requested by the user to the existing tasks.

CRITICAL RULES:
1. Return ONLY a valid JSON object. No markdown, no code blocks, no explanations.
2. Make ONLY the changes the user explicitly requested
3. Keep ALL other task data EXACTLY as provided
4. Do NOT add new tasks unless explicitly requested
5. Do NOT remove tasks unless explicitly requested
6. Do NOT change fields that weren't mentioned

The user will provide:
- Current tasks (the source of truth with any manual edits)
- A modification request (what they want to change)

Your response format:
{
  "project_name": "keep existing or update if requested",
  "tasks": [
    // Modified tasks array - preserve all unchanged data
  ]
}

EXAMPLES:

Input:
Current tasks: [{"id": "task_1", "title": "Design homepage", "duration_days": 5, "owner": "Alice", "dependencies": []}]
Request: "Change the duration to 3 days"
Output:
{
  "project_name": null,
  "tasks": [
    {"id": "task_1", "title": "Design homepage", "duration_days": 3, "owner": "Alice", "dependencies": []}
  ]
}

Input:
Current tasks: [
  {"id": "task_1", "title": "Design UI", "duration_days": 5, "owner": null, "dependencies": []},
  {"id": "task_2", "title": "Build API", "duration_days": 7, "owner": null, "dependencies": ["task_1"]}
]
Request: "Assign task 1 to Bob and task 2 to Alice"
Output:
{
  "project_name": null,
  "tasks": [
    {"id": "task_1", "title": "Design UI", "duration_days": 5, "owner": "Bob", "dependencies": []},
    {"id": "task_2", "title": "Build API", "duration_days": 7, "owner": "Alice", "dependencies": ["task_1"]}
  ]
}

Input:
Current tasks: [{"id": "task_1", "title": "Visit beaches", "duration_days": 2, "owner": null, "dependencies": []}]
Request: "Add a task to visit forts after the beach task"
Output:
{
  "project_name": null,
  "tasks": [
    {"id": "task_1", "title": "Visit beaches", "duration_days": 2, "owner": null, "dependencies": []},
    {"id": "task_2", "title": "Visit forts", "duration_days": 1, "owner": null, "dependencies": ["task_1"]}
  ]
}

REMEMBER:
- Preserve ALL unchanged data exactly as provided
- Only modify what the user explicitly requests
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
