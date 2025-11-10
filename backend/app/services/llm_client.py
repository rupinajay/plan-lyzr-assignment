import os
import httpx
import json
from typing import List, Dict, Any, Optional


class LLMClient:
    """
    Modular LLM client wrapper with OpenAI-compatible interface.
    Supports GROQ, OpenAI, Anthropic, or any provider by changing BASE_URL.
    """
    
    def __init__(self, base_url: Optional[str] = None, api_key: Optional[str] = None, timeout: int = 60):
        self.base_url = base_url or os.getenv("LLM_BASE_URL", "https://api.groq.com/openai/v1")
        self.api_key = api_key or os.getenv("LLM_API_KEY")
        self.timeout = timeout
        self.client = httpx.AsyncClient(timeout=timeout)
        
        if not self.api_key:
            raise ValueError("LLM_API_KEY must be set in environment variables")
    
    async def chat(self, messages: List[Dict[str, str]], model: str = "openai/gpt-oss-20b") -> Dict[str, Any]:
        """
        Generic chat endpoint: provider-agnostic request builder.
        For GROQ, uses their OpenAI-compatible endpoint.
        """
        url = f"{self.base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": model,
            "messages": messages,
            "temperature": 0.3,  # Lower temperature for more focused, accurate extraction
            "max_tokens": 3000,  # More tokens for detailed responses
            "top_p": 0.9
        }
        
        try:
            resp = await self.client.post(url, json=payload, headers=headers)
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPStatusError as e:
            # Get detailed error message from response
            error_detail = "Unknown error"
            try:
                error_json = e.response.json()
                error_detail = error_json.get("error", {}).get("message", str(error_json))
            except:
                error_detail = e.response.text
            raise Exception(f"LLM API call failed: {e.response.status_code} - {error_detail}")
        except httpx.HTTPError as e:
            raise Exception(f"LLM API call failed: {str(e)}")
    
    async def extract_json(self, messages: List[Dict[str, str]], schema_prompt: str, model: str = "openai/gpt-oss-20b", max_retries: int = 2) -> Dict[str, Any]:
        """
        Convenience method: ask the LLM to return structured JSON following a schema.
        Includes retry logic and robust JSON extraction.
        """
        prompt = [{"role": "system", "content": schema_prompt}] + messages
        
        for attempt in range(max_retries):
            try:
                res = await self.chat(prompt, model=model)
                
                # Extract content from response
                content = res["choices"][0]["message"]["content"].strip()
                
                # Clean up various markdown formats
                if "```json" in content:
                    # Extract from ```json ... ```
                    content = content.split("```json")[1].split("```")[0].strip()
                elif "```" in content:
                    # Extract from ``` ... ```
                    content = content.split("```")[1].split("```")[0].strip()
                
                # Remove any leading/trailing whitespace or newlines
                content = content.strip()
                
                # Try to find JSON object if there's extra text
                if not content.startswith("{"):
                    # Look for first { and last }
                    start = content.find("{")
                    end = content.rfind("}") + 1
                    if start != -1 and end > start:
                        content = content[start:end]
                
                # Parse JSON
                parsed = json.loads(content)
                
                # Validate structure
                if not isinstance(parsed, dict):
                    raise ValueError("Response is not a JSON object")
                
                if "tasks" not in parsed:
                    parsed["tasks"] = []
                
                if "project_name" not in parsed:
                    parsed["project_name"] = None
                
                # Validate tasks structure
                if isinstance(parsed["tasks"], list):
                    for task in parsed["tasks"]:
                        if not isinstance(task, dict):
                            continue
                        # Ensure required fields
                        if "id" not in task:
                            task["id"] = f"task_{len(parsed['tasks'])}"
                        if "title" not in task:
                            task["title"] = "Untitled Task"
                        if "duration_days" not in task or not isinstance(task["duration_days"], (int, float)):
                            task["duration_days"] = 5
                        if "owner" not in task:
                            task["owner"] = None
                        if "dependencies" not in task:
                            task["dependencies"] = []
                        
                        # Ensure duration is positive integer
                        task["duration_days"] = max(1, int(task["duration_days"]))
                
                return parsed
                
            except (KeyError, IndexError) as e:
                if attempt < max_retries - 1:
                    # Retry with more explicit instructions
                    prompt.append({
                        "role": "user",
                        "content": "Please return ONLY the JSON object with no additional text or formatting."
                    })
                    continue
                return {"project_name": None, "tasks": [], "error": f"Invalid response structure: {str(e)}"}
            
            except json.JSONDecodeError as e:
                if attempt < max_retries - 1:
                    # Retry
                    continue
                # Last attempt failed - return error with raw content for debugging
                return {
                    "project_name": None,
                    "tasks": [],
                    "error": f"JSON parse error: {str(e)}",
                    "raw_content": content[:200]  # First 200 chars for debugging
                }
            
            except Exception as e:
                if attempt < max_retries - 1:
                    continue
                return {"project_name": None, "tasks": [], "error": f"Unexpected error: {str(e)}"}
        
        # Should not reach here, but just in case
        return {"project_name": None, "tasks": [], "error": "Max retries exceeded"}
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()
