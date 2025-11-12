from fastapi import APIRouter, HTTPException
from ..models.schemas import ChatRequest, ChatResponse
from ..storage import get_session
from ..services.parser import extract_entities_from_messages, merge_entities

router = APIRouter(prefix="/api", tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Accept chat message, store it, and extract project entities using LLM.
    If current_tasks are provided, modify them instead of re-extracting.
    """
    try:
        # Get or create session
        session = get_session(request.session_id)
        
        # Append user message
        session.append_message(request.text)
        
        # Determine if this is a modification request or initial extraction
        if request.current_tasks is not None and len(request.current_tasks) > 0:
            # This is a modification request - preserve manual edits
            from ..services.parser import modify_tasks
            
            current_project_name = session.entities.get("project_name")
            new_entities = await modify_tasks(
                request.current_tasks,
                request.text,
                current_project_name
            )
            
            # Update session with modified entities
            session.update_entities(new_entities)
            merged_entities = new_entities
        else:
            # This is initial extraction or no tasks exist yet
            new_entities = await extract_entities_from_messages(session.messages)
            
            print(f"[DEBUG] AI Response: {new_entities}")
            print(f"[DEBUG] Has clarification_needed: {new_entities.get('clarification_needed')}")
            print(f"[DEBUG] AI Message: {new_entities.get('message')}")
            
            # Check if AI needs clarification
            if new_entities.get("clarification_needed"):
                # Return the clarification message to the user
                clarification_message = new_entities.get("message", "I need more information to create a proper plan. Could you provide more details?")
                print(f"[DEBUG] Returning clarification: {clarification_message}")
                return ChatResponse(
                    session_id=session.id,
                    entities=session.entities,  # Return existing entities, don't change them
                    message=clarification_message
                )
            
            # Check for extraction errors
            if "error" in new_entities:
                print(f"Warning: Entity extraction had issues: {new_entities.get('error')}")
                new_entities.pop("error", None)
                new_entities.pop("raw_content", None)
            
            # Merge with existing entities
            merged_entities = merge_entities(session.entities, new_entities)
            session.update_entities(merged_entities)
        
        #  ALWAYS use the AI's message - NO hardcoded messages!
        # The AI provides context-aware messages for all scenarios:
        # - Clarification requests
        # - Task creation with assignments
        # - Task creation without assignments
        message = new_entities.get("message", "I'm ready to help you plan your project!")
        
        return ChatResponse(
            session_id=session.id,
            entities=merged_entities,
            message=message
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")
