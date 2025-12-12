"""
Conversation Agent Service - Handles AI-powered contractor communication with Gemini
"""
import os
import json
import logging
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from django.conf import settings
from django.utils import timezone

from core.models import (
    ContractingPlanning,
    Message,
    MessageAction,
    Contractor,
    EmailCredential
)
from core.services.gemini_service.gemini_service import get_gemini_service
from core.services.gmail_service import GmailService
import google.generativeai as genai

logger = logging.getLogger(__name__)


class ConversationAgent:
    """
    AI agent that facilitates communication between users and contractors
    using Gemini AI with function calling capabilities.
    """
    
    # Tool definition for Gemini function calling
    SEND_EMAIL_TOOL = genai.protos.FunctionDeclaration(
        name="send_email",
        description="Draft and send an email to the contractor on behalf of the user",
        parameters=genai.protos.Schema(
            type=genai.protos.Type.OBJECT,
            properties={
                "subject": genai.protos.Schema(
                    type=genai.protos.Type.STRING,
                    description="Email subject line (concise, clear, in German)"
                ),
                "body_html": genai.protos.Schema(
                    type=genai.protos.Type.STRING,
                    description="Email body in HTML format (professional, polite, in German)"
                ),
                "reasoning": genai.protos.Schema(
                    type=genai.protos.Type.STRING,
                    description="Brief explanation of why this email helps the user (1-2 sentences)"
                ),
                "action_summary": genai.protos.Schema(
                    type=genai.protos.Type.STRING,
                    description="One-sentence summary for future conversation context"
                )
            },
            required=["subject", "body_html", "reasoning", "action_summary"]
        )
    )
    
    FETCH_EMAIL_TOOL = genai.protos.FunctionDeclaration(
        name="fetch_email",
        description="Fetch and review recent emails from the contractor to understand their responses, questions, or any communication history",
        parameters=genai.protos.Schema(
            type=genai.protos.Type.OBJECT,
            properties={
                "max_emails": genai.protos.Schema(
                    type=genai.protos.Type.INTEGER,
                    description="Maximum number of recent emails to fetch (default: 5, max: 10)"
                ),
                "reasoning": genai.protos.Schema(
                    type=genai.protos.Type.STRING,
                    description="Brief explanation of why fetching these emails will help the user"
                ),
                "action_summary": genai.protos.Schema(
                    type=genai.protos.Type.STRING,
                    description="One-sentence summary for future conversation context"
                )
            },
            required=["reasoning", "action_summary"]
        )
    )
    
    def __init__(self):
        """Initialize the conversation agent with Gemini service."""
        self.gemini_service = get_gemini_service()
    
    def _load_prompt_template(self) -> str:
        """Load the conversation agent prompt template."""
        prompt_path = os.path.join(
            settings.BASE_DIR,
            'core',
            'services',
            'gemini_service',
            'prompts',
            'contracting',
            'conversation_agent_prompt.md'
        )
        
        try:
            with open(prompt_path, 'r', encoding='utf-8') as f:
                return f.read()
        except FileNotFoundError:
            logger.error(f"Prompt template not found at {prompt_path}")
            raise
    
    def _build_context(
        self,
        planning: ContractingPlanning,
        contractor_id: int,
        user
    ) -> Dict[str, str]:
        """
        Build context dictionary for the Gemini prompt.
        
        Args:
            planning: ContractingPlanning instance
            contractor_id: ID of the contractor
            user: User instance
            
        Returns:
            Dictionary with all context variables
        """
        project = planning.project
        
        # Get contractor info
        contractor = Contractor.objects.filter(id=contractor_id).first()
        contractor_name = contractor.name if contractor else "Unknown"
        contractor_email = contractor.email if contractor else "Unknown"
        contractor_specialties = ", ".join(contractor.project_types) if contractor and contractor.project_types else "General contractor"
        
        # Get conversation history (last 15 messages)
        messages = Message.objects.filter(
            contracting_planning=planning,
            contractor_id=contractor_id
        ).order_by('-timestamp')[:15]
        
        # Reverse to chronological order
        messages = list(reversed(messages))
        
        # Format conversation history
        conversation_history = self._format_conversation_history(messages)
        
        # Build context dictionary
        context = {
            'current_date': datetime.now().strftime('%Y-%m-%d'),
            'project_name': project.name or "Renovation Project",
            'project_type': project.project_type or "Not specified",
            'project_location': f"{project.address}, {project.postal_code} {project.city}" if project.address else "Not specified",
            'project_budget': f"€{project.budget:,.0f}" if project.budget else "Not specified",
            'contractor_name': contractor_name,
            'contractor_email': contractor_email,
            'contractor_specialties': contractor_specialties,
            'user_name': f"{user.first_name} {user.last_name}".strip() or user.username,
            'user_email': user.email,
            'user_phone': getattr(user, 'phone', 'Not provided'),
            'conversation_history': conversation_history,
        }
        
        return context
    
    def _format_conversation_history(self, messages: List[Message]) -> str:
        """
        Format conversation history for the prompt.
        
        Args:
            messages: List of Message objects in chronological order
            
        Returns:
            Formatted conversation history string
        """
        if not messages:
            return "No previous messages."
        
        history_lines = []
        for msg in messages:
            if msg.message_type == 'user':
                history_lines.append(f"[User]: {msg.content}")
            elif msg.message_type == 'ai':
                history_lines.append(f"[AI]: {msg.content}")
            elif msg.message_type == 'ai_action_executed':
                # For executed actions, show the action summary
                try:
                    action = msg.action
                    history_lines.append(f"[Action]: {action.action_summary}")
                except MessageAction.DoesNotExist:
                    history_lines.append(f"[AI]: {msg.content}")
        
        return "\n".join(history_lines)
    
    def _build_prompt(self, context: Dict[str, str], user_message: str) -> str:
        """
        Build the complete prompt with context and user message.
        
        Args:
            context: Context dictionary
            user_message: Current user message
            
        Returns:
            Complete prompt string
        """
        template = self._load_prompt_template()
        
        # Add user message to context
        context['user_message'] = user_message
        
        # Replace all placeholders
        prompt = template
        for key, value in context.items():
            placeholder = "{" + key + "}"
            prompt = prompt.replace(placeholder, str(value))
        
        return prompt
    
    def process_user_message(
        self,
        planning: ContractingPlanning,
        contractor_id: int,
        message_content: str,
        user,
        attachments: List = None,
        attachment_ids: List[int] = None
    ) -> Dict:
        """
        Process a user message and generate AI response.
        
        Args:
            planning: ContractingPlanning instance
            contractor_id: ID of the contractor
            message_content: User's message content
            user: User instance
            attachments: Optional list of file attachments
            
        Returns:
            Dictionary with response data
        """
        try:
            # Build context
            context = self._build_context(planning, contractor_id, user)
            
            # Build prompt
            prompt = self._build_prompt(context, message_content)
            
            # Process attachments if present
            uploaded_files = []
            if attachments:
                for attachment in attachments:
                    try:
                        # Upload file to Gemini
                        file_content = attachment.read()
                        mime_type = attachment.content_type or 'application/octet-stream'
                        
                        # Upload file to Gemini API
                        uploaded_file = genai.upload_file(
                            path=None,
                            mime_type=mime_type,
                            name=attachment.name,
                            display_name=attachment.name
                        )
                        # For files uploaded via bytes, we need to use a different approach
                        # Create a temporary file
                        import tempfile
                        with tempfile.NamedTemporaryFile(delete=False, suffix=f"_{attachment.name}") as tmp_file:
                            tmp_file.write(file_content)
                            tmp_path = tmp_file.name
                        
                        # Upload the temporary file
                        uploaded_file = genai.upload_file(path=tmp_path, display_name=attachment.name)
                        uploaded_files.append(uploaded_file)
                        
                        # Clean up temp file
                        import os
                        os.unlink(tmp_path)
                        
                        logger.info(f"Uploaded file: {attachment.name} to Gemini")
                    except Exception as e:
                        logger.error(f"Error uploading file {attachment.name}: {str(e)}")
            
            # Create tool wrapper with both tools
            tools = genai.protos.Tool(
                function_declarations=[self.SEND_EMAIL_TOOL, self.FETCH_EMAIL_TOOL]
            )
            
            # Create model with function calling enabled
            model = genai.GenerativeModel(
                self.gemini_service.model_name,
                tools=[tools]
            )
            
            # Prepare content for generation (text + files)
            content_parts = [prompt]
            if uploaded_files:
                content_parts.extend(uploaded_files)
                # Add instruction about files
                file_names = ', '.join([f.display_name for f in uploaded_files])
                content_parts.insert(1, f"\n\n**User has attached the following files:** {file_names}\nPlease review these files and respond accordingly.")
            
            # Generate response
            response = model.generate_content(content_parts)
            
            # Check if function call was made
            if response.candidates and response.candidates[0].content.parts:
                for part in response.candidates[0].content.parts:
                    if hasattr(part, 'function_call') and part.function_call:
                        # Function call detected
                        return self._handle_function_call(
                            part.function_call,
                            planning,
                            contractor_id,
                            attachment_ids=attachment_ids
                        )
            
            # No function call, return normal text response
            if response.text:
                return self._create_normal_response(
                    response.text,
                    planning,
                    contractor_id
                )
            else:
                # Fallback response
                return self._create_normal_response(
                    "I'm here to help with your contractor communication. How can I assist you?",
                    planning,
                    contractor_id
                )
        
        except Exception as e:
            logger.error(f"Error processing user message: {str(e)}", exc_info=True)
            # Return fallback response
            return self._create_normal_response(
                f"I apologize, but I encountered an error processing your message. Please try again.",
                planning,
                contractor_id
            )
    
    def _handle_function_call(
        self,
        function_call,
        planning: ContractingPlanning,
        contractor_id: int,
        attachment_ids: List[int] = None
    ) -> Dict:
        """
        Handle a function call from Gemini.
        
        Args:
            function_call: FunctionCall object from Gemini
            planning: ContractingPlanning instance
            contractor_id: ID of the contractor
            attachment_ids: Optional list of MessageAttachment IDs
            
        Returns:
            Dictionary with action request data
        """
        function_name = function_call.name
        args = dict(function_call.args)
        
        if function_name == 'send_email':
            return self._create_action_request(
                'send_email',
                args,
                planning,
                contractor_id,
                attachment_ids=attachment_ids
            )
        elif function_name == 'fetch_email':
            return self._create_action_request(
                'fetch_email',
                args,
                planning,
                contractor_id
            )
        else:
            logger.warning(f"Unknown function call: {function_name}")
            return self._create_normal_response(
                "I'm here to help. What would you like to know?",
                planning,
                contractor_id
            )
    
    def _create_normal_response(
        self,
        content: str,
        planning: ContractingPlanning,
        contractor_id: int
    ) -> Dict:
        """
        Create a normal AI response message.
        
        Args:
            content: Response content
            planning: ContractingPlanning instance
            contractor_id: ID of the contractor
            
        Returns:
            Dictionary with message data
        """
        message = Message.objects.create(
            contracting_planning=planning,
            contractor_id=contractor_id,
            sender='ai',
            message_type='ai',
            content=content
        )
        
        return {
            'type': 'normal',
            'message': message
        }
    
    def _create_action_request(
        self,
        action_type: str,
        args: Dict,
        planning: ContractingPlanning,
        contractor_id: int,
        attachment_ids: List[int] = None
    ) -> Dict:
        """
        Create an action request message.
        
        Args:
            action_type: Type of action ('send_email' or 'fetch_email')
            args: Function call arguments
            planning: ContractingPlanning instance
            contractor_id: ID of the contractor
            attachment_ids: Optional list of MessageAttachment IDs to include
            
        Returns:
            Dictionary with action request data
        """
        reasoning = args.get('reasoning', '')
        action_summary = args.get('action_summary', '')
        
        # Get contractor info
        contractor = Contractor.objects.filter(id=contractor_id).first()
        contractor_name = contractor.name if contractor else "the contractor"
        
        # Create action data and message content based on action type
        if action_type == 'send_email':
            subject = args.get('subject', '')
            body_html = args.get('body_html', '')
            
            message_content = f"I've drafted an email for {contractor_name}. Please review it below and let me know if you'd like me to send it or make any changes! 📧"
            
            action_data = {
                'subject': subject,
                'body_html': body_html,
                'recipient_email': self._get_contractor_email(contractor_id),
                'reasoning': reasoning
            }
            
            # Add attachment IDs if present
            if attachment_ids:
                action_data['attachment_ids'] = attachment_ids
        
        elif action_type == 'fetch_email':
            max_emails = args.get('max_emails', 5)
            # Ensure max_emails is within bounds
            max_emails = min(max(1, int(max_emails)), 10)
            
            message_content = f"I'll fetch the last {max_emails} email(s) from {contractor_name} to review their communication. 📬"
            
            action_data = {
                'max_emails': max_emails,
                'contractor_email': self._get_contractor_email(contractor_id),
                'reasoning': reasoning
            }
        
        else:
            raise ValueError(f"Unknown action type: {action_type}")
        
        # Create message
        message = Message.objects.create(
            contracting_planning=planning,
            contractor_id=contractor_id,
            sender='ai',
            message_type='ai_action_request',
            content=message_content
        )
        
        # Create MessageAction
        action = MessageAction.objects.create(
            message=message,
            action_type=action_type,
            action_status='pending',
            action_data=action_data,
            action_summary=action_summary
        )
        
        return {
            'type': 'action_request',
            'message': message,
            'action': action
        }
    
    def _get_contractor_email(self, contractor_id: int) -> str:
        """Get contractor email address."""
        contractor = Contractor.objects.filter(id=contractor_id).first()
        return contractor.email if contractor else ""
    
    def execute_action(
        self,
        action_id: int,
        user,
        modifications: Optional[str] = None,
        modified_email_html: Optional[str] = None
    ) -> Dict:
        """
        Execute a pending action.
        
        Args:
            action_id: ID of the MessageAction
            user: User instance
            modifications: Optional modification instructions from user
            modified_email_html: Optional directly modified email HTML
            
        Returns:
            Dictionary with execution result
        """
        try:
            # Get the action
            action = MessageAction.objects.select_related('message').get(id=action_id)
            
            # Verify action can be executed (pending or failed - allow retry)
            if action.action_status not in ['pending', 'failed']:
                raise ValueError(f"Action cannot be executed (status: {action.action_status}). Only pending or failed actions can be executed.")
            
            # Verify user owns this action
            message = action.message
            planning = message.contracting_planning
            if planning.project.user != user:
                raise ValueError("User does not have permission to execute this action")
            
            # Reset status to pending if it was failed (for retry)
            if action.action_status == 'failed':
                action.action_status = 'pending'
                action.execution_result = None
                action.save()
                logger.info(f"Retrying failed action {action_id}")
            
            # Handle modifications if provided
            if modifications or modified_email_html:
                action = self._apply_modifications(
                    action,
                    modifications,
                    modified_email_html,
                    user
                )
            
            # Execute the action based on type
            if action.action_type == 'send_email':
                result = self._execute_send_email(action, user)
            elif action.action_type == 'fetch_email':
                result = self._execute_fetch_email(action, user)
            else:
                raise ValueError(f"Unknown action type: {action.action_type}")
            
            # Update action status
            action.action_status = 'executed'
            action.execution_result = result
            action.save()
            
            # Update message type
            message.message_type = 'ai_action_executed'
            message.content = f"✓ {action.action_summary}"
            message.save()
            
            # Create confirmation message based on action type
            if action.action_type == 'send_email':
                confirmation_content = f"Email successfully sent to {action.action_data.get('recipient_email', 'contractor')}. I'll let you know if they reply."
            elif action.action_type == 'fetch_email':
                emails_fetched = result.get('emails_count', 0)
                
                if emails_fetched > 0:
                    # Analyze the fetched emails and provide a summary
                    email_summary = self._analyze_fetched_emails(
                        result.get('emails', []),
                        planning,
                        message.contractor_id,
                        user
                    )
                    confirmation_content = email_summary
                else:
                    confirmation_content = "I couldn't find any recent emails from this contractor in your inbox. They may not have sent anything yet, or the emails might be in a different folder."
            else:
                confirmation_content = "Action completed successfully."


            
            confirmation_message = Message.objects.create(
                contracting_planning=planning,
                contractor_id=message.contractor_id,
                sender='ai',
                message_type='ai',
                content=confirmation_content
            )
            
            return {
                'success': True,
                'action': action,
                'confirmation_message': confirmation_message,
                'result': result
            }
        
        except Exception as e:
            logger.error(f"Error executing action: {str(e)}", exc_info=True)
            
            # Update action status to failed
            if 'action' in locals():
                action.action_status = 'failed'
                action.execution_result = {'error': str(e)}
                action.save()
            
            return {
                'success': False,
                'error': str(e)
            }
    
    def _apply_modifications(
        self,
        action: MessageAction,
        modifications: Optional[str],
        modified_email_html: Optional[str],
        user
    ) -> MessageAction:
        """
        Apply user modifications to the action.
        
        Args:
            action: MessageAction instance
            modifications: Modification instructions
            modified_email_html: Direct HTML modifications
            user: User instance
            
        Returns:
            Updated MessageAction instance
        """
        if modified_email_html:
            # User directly edited the HTML
            action.action_data['body_html'] = modified_email_html
            action.save()
        elif modifications:
            # User provided modification instructions - re-prompt Gemini
            current_email_html = action.action_data.get('body_html', '')
            planning = action.message.contracting_planning
            contractor_id = action.message.contractor_id
            
            # Build context for modification
            context = self._build_context(planning, contractor_id, user)
            
            # Load email modification prompt template
            prompt_path = os.path.join(
                settings.BASE_DIR,
                'core',
                'services',
                'gemini_service',
                'prompts',
                'contracting',
                'email_modification_prompt.md'
            )
            
            with open(prompt_path, 'r', encoding='utf-8') as f:
                template = f.read()
            
            # Build modification prompt
            prompt = template.replace('{project_name}', context['project_name'])
            prompt = prompt.replace('{project_type}', context['project_type'])
            prompt = prompt.replace('{project_location}', context['project_location'])
            prompt = prompt.replace('{current_email_html}', current_email_html)
            prompt = prompt.replace('{user_prompt}', modifications)
            
            # Call Gemini for modification
            model = genai.GenerativeModel(self.gemini_service.model_name)
            response = model.generate_content(prompt)
            
            if response.text:
                try:
                    # Parse JSON response
                    response_text = response.text.strip()
                    # Remove markdown code blocks if present
                    if response_text.startswith('```'):
                        lines = response_text.split('\n')
                        response_text = '\n'.join(lines[1:-1]) if len(lines) > 2 else response_text
                    
                    result = json.loads(response_text)
                    action.action_data['body_html'] = result.get('email_html', current_email_html)
                    action.save()
                except json.JSONDecodeError:
                    logger.error(f"Failed to parse Gemini modification response: {response.text}")
        
        return action
    
    def _execute_send_email(self, action: MessageAction, user) -> Dict:
        """
        Execute send email action.
        
        Args:
            action: MessageAction instance
            user: User instance
            
        Returns:
            Execution result dictionary
        """
        from core.models import MessageAttachment
        
        # Get user's email credentials
        email_cred = EmailCredential.objects.filter(user=user).first()
        
        if not email_cred or not email_cred.access_token:
            raise ValueError("User does not have email credentials configured. Please connect your Gmail account first.")
        
        # Check if token needs refresh
        if email_cred.token_expiry and timezone.now() >= email_cred.token_expiry:
            if not email_cred.refresh_token:
                raise ValueError("Gmail credentials have expired and cannot be refreshed. Please reconnect your Gmail account.")
            
            try:
                # Refresh the access token
                refreshed = GmailService.refresh_access_token(email_cred.refresh_token)
                email_cred.access_token = refreshed['access_token']
                email_cred.token_expiry = refreshed['token_expiry']
                email_cred.save()
                logger.info(f"Successfully refreshed access token for user {user.id}")
            except Exception as e:
                logger.error(f"Failed to refresh access token: {str(e)}", exc_info=True)
                raise ValueError("Failed to refresh Gmail credentials. Please reconnect your Gmail account.")
        
        # Get email data
        subject = action.action_data.get('subject', '')
        body_html = action.action_data.get('body_html', '')
        recipient_email = action.action_data.get('recipient_email', '')
        attachment_ids = action.action_data.get('attachment_ids', [])
        
        if not recipient_email:
            raise ValueError("Recipient email not found")
        
        # Prepare attachments if any
        attachments = []
        if attachment_ids:
            for att_id in attachment_ids:
                try:
                    msg_attachment = MessageAttachment.objects.get(id=att_id)
                    # Read file content
                    msg_attachment.file.open('rb')
                    file_content = msg_attachment.file.read()
                    msg_attachment.file.close()
                    
                    attachments.append({
                        'filename': msg_attachment.filename,
                        'content': file_content,
                        'content_type': msg_attachment.content_type
                    })
                    logger.info(f"Added attachment: {msg_attachment.filename}")
                except MessageAttachment.DoesNotExist:
                    logger.warning(f"MessageAttachment {att_id} not found, skipping")
                except Exception as e:
                    logger.error(f"Error reading attachment {att_id}: {str(e)}")
        
        # Send email via Gmail API
        result = GmailService.send_email(
            access_token=email_cred.access_token,
            to=recipient_email,
            subject=subject,
            body=body_html,  # Plain text fallback
            html_body=body_html,
            attachments=attachments if attachments else None
        )
        
        return {
            'message_id': result.get('message_id'),
            'thread_id': result.get('thread_id'),
            'recipient': recipient_email,
            'subject': subject,
            'attachments_count': len(attachments)
        }
    
    def _analyze_fetched_emails(
        self,
        emails: List[Dict],
        planning: ContractingPlanning,
        contractor_id: int,
        user
    ) -> str:
        """
        Analyze fetched emails using Gemini and provide a helpful summary.
        
        Args:
            emails: List of fetched email dictionaries
            planning: ContractingPlanning instance
            contractor_id: ID of the contractor
            user: User instance
            
        Returns:
            AI-generated summary of the emails
        """
        if not emails:
            return "No emails found from this contractor."
        
        # Build context for analysis
        context = self._build_context(planning, contractor_id, user)
        
        # Format emails for the prompt (emails are already sorted by date, most recent first)
        emails_text = ""
        for i, email in enumerate(emails, 1):
            received_at = email.get('received_at', 'Unknown date')
            subject = email.get('subject', 'No subject')
            body = email.get('body', 'No content')
            
            # Truncate very long emails
            if len(body) > 2000:
                body = body[:2000] + "... [email continues]"
            
            # Mark the first email as most recent
            label = f"Email {i}" + (" (MOST RECENT)" if i == 1 else f" (older)")
            emails_text += f"\n\n--- {label} ---\n"
            emails_text += f"Date: {received_at}\n"
            emails_text += f"Subject: {subject}\n"
            emails_text += f"Content:\n{body}\n"
        
        # Create analysis prompt
        prompt = f"""You are analyzing emails from a contractor for a renovation project.

**Project Context:**
- Project: {context['project_name']} ({context['project_type']})
- Location: {context['project_location']}
- Contractor: {context['contractor_name']}

**User's Recent Conversation:**
{context['conversation_history'][-500:] if len(context['conversation_history']) > 500 else context['conversation_history']}

**Fetched Emails from Contractor (sorted by date, most recent first):**
{emails_text}

**Your Task:**
Analyze these emails and provide a helpful, conversational summary for the user. Focus on:
1. Key information or responses from the contractor (especially from the most recent email)
2. Any questions they're asking
3. Important dates, availability, or timeline mentions
4. Any concerns or issues raised
5. Next steps or action items

**CRITICAL Style Guidelines:**
- Write in a natural, flowing conversational style like you're talking to a friend
- DO NOT use markdown formatting (no asterisks, no bold, no bullet points)
- DO NOT use lists or bullet points - write in complete sentences and paragraphs
- Be warm and friendly (use 1-2 emojis max, placed naturally in the text)
- Start with: "I found {len(emails)} email(s) from {{contractor_name}}..."
- Focus primarily on the MOST RECENT email, mentioning key points naturally
- If there are multiple points, connect them with words like "They also mentioned..." or "Additionally..."
- Keep it conversational and easy to read (2-4 short paragraphs maximum)
- End with a helpful suggestion for next steps if appropriate

Example of good style:
"I found 2 emails from BauMeister GmbH. In their most recent message from yesterday, they said they can start next Monday and asked about your flooring preference. They also mentioned the project will take about 3 weeks. Sounds like they're ready to move forward! Would you like me to reply about the flooring?"

Provide your summary now:"""
        
        try:
            model = genai.GenerativeModel(self.gemini_service.model_name)
            response = model.generate_content(prompt)
            
            if response.text:
                return response.text.strip()
            else:
                return f"I found {len(emails)} email(s) from the contractor, but I couldn't generate a summary. Please review them directly."
        
        except Exception as e:
            logger.error(f"Error analyzing emails: {str(e)}", exc_info=True)
            # Fallback to simple summary
            return f"I found {len(emails)} email(s) from {context['contractor_name']}. The most recent one was about: {emails[0].get('subject', 'No subject')}"
    
    def _execute_fetch_email(self, action: MessageAction, user) -> Dict:
        """
        Execute fetch email action.
        
        Args:
            action: MessageAction instance
            user: User instance
            
        Returns:
            Execution result dictionary with fetched emails
        """
        # Get user's email credentials
        email_cred = EmailCredential.objects.filter(user=user).first()
        
        if not email_cred or not email_cred.access_token:
            raise ValueError("User does not have email credentials configured. Please connect your Gmail account first.")
        
        # Check if token needs refresh
        if email_cred.token_expiry and timezone.now() >= email_cred.token_expiry:
            if not email_cred.refresh_token:
                raise ValueError("Gmail credentials have expired and cannot be refreshed. Please reconnect your Gmail account.")
            
            try:
                # Refresh the access token
                refreshed = GmailService.refresh_access_token(email_cred.refresh_token)
                email_cred.access_token = refreshed['access_token']
                email_cred.token_expiry = refreshed['token_expiry']
                email_cred.save()
                logger.info(f"Successfully refreshed access token for user {user.id}")
            except Exception as e:
                logger.error(f"Failed to refresh access token: {str(e)}", exc_info=True)
                raise ValueError("Failed to refresh Gmail credentials. Please reconnect your Gmail account.")
        
        # Get fetch parameters
        max_emails = action.action_data.get('max_emails', 5)
        contractor_email = action.action_data.get('contractor_email', '')
        
        if not contractor_email:
            raise ValueError("Contractor email not found")
        
        # Search for emails from the contractor
        message_list = GmailService.search_messages(
            access_token=email_cred.access_token,
            from_email=contractor_email,
            max_results=max_emails
        )
        
        # Fetch full details for each email
        fetched_emails = []
        for msg in message_list:
            try:
                details = GmailService.get_message_details(
                    access_token=email_cred.access_token,
                    message_id=msg['id']
                )
                fetched_emails.append({
                    'message_id': details['message_id'],
                    'thread_id': details['thread_id'],
                    'from': details['from'],
                    'subject': details['subject'],
                    'body': details['body'],
                    'received_at': details['received_at'].isoformat() if details['received_at'] else None,
                    'received_at_datetime': details['received_at'],  # Keep datetime object for sorting
                })
            except Exception as e:
                logger.warning(f"Failed to fetch details for message {msg['id']}: {str(e)}")
                continue
        
        # Sort emails by received date (most recent first)
        fetched_emails.sort(
            key=lambda x: x['received_at_datetime'] if x['received_at_datetime'] else datetime.min.replace(tzinfo=timezone.utc),
            reverse=True
        )
        
        # Remove the temporary datetime field before returning
        for email in fetched_emails:
            email.pop('received_at_datetime', None)
        
        return {
            'emails_count': len(fetched_emails),
            'contractor_email': contractor_email,
            'emails': fetched_emails
        }
    
    def reject_action(self, action_id: int, user) -> Dict:
        """
        Reject a pending action.
        
        Args:
            action_id: ID of the MessageAction
            user: User instance
            
        Returns:
            Dictionary with rejection result
        """
        try:
            # Get the action
            action = MessageAction.objects.select_related('message').get(id=action_id)
            
            # Verify action is pending
            if action.action_status != 'pending':
                raise ValueError(f"Action is not pending (status: {action.action_status})")
            
            # Verify user owns this action
            message = action.message
            planning = message.contracting_planning
            if planning.project.user != user:
                raise ValueError("User does not have permission to reject this action")
            
            # Update action status
            action.action_status = 'rejected'
            action.save()
            
            # Update message to indicate rejection
            message.content = f"[Rejected] {action.action_summary}"
            message.save()
            
            return {
                'success': True,
                'action': action
            }
        
        except Exception as e:
            logger.error(f"Error rejecting action: {str(e)}", exc_info=True)
            return {
                'success': False,
                'error': str(e)
            }
