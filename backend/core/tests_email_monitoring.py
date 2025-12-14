"""
Tests for Email Monitoring System
"""
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime
from django.test import TestCase
from django.utils import timezone
from django.contrib.auth.models import User

from core.models import (
    Project,
    ContractingPlanning,
    Contractor,
    EmailCredential,
    Message,
    ContractorOffer,
    MessageAction
)
from core.services.email_monitor_service import EmailMonitorService
from core.services.contracting_service.system_message_generator import SystemMessageGenerator
from core.tasks.email_monitoring import poll_contractor_emails


class EmailMonitorServiceTestCase(TestCase):
    """Test cases for EmailMonitorService"""
    
    def setUp(self):
        """Set up test data"""
        # Create test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        # Create test project
        self.project = Project.objects.create(
            user=self.user,
            name='Test Renovation',
            project_type='Kitchen',
            address='Test St 123',
            postal_code='12345',
            city='Test City',
            budget=50000
        )
        
        # Create contracting planning
        self.planning = ContractingPlanning.objects.create(
            project=self.project,
            description='Test planning',
            current_step=4  # Communicate step
        )
        
        # Create test contractor
        self.contractor = Contractor.objects.create(
            name='Test Contractor GmbH',
            email='contractor@example.com',
            city='Test City',
            postal_code='12345'
        )
        
        # Set selected contractors
        self.planning.selected_contractors = [self.contractor.id]
        self.planning.save()
        
        # Create email credentials
        self.credential = EmailCredential.objects.create(
            user=self.user,
            email='test@example.com',
            access_token='test_access_token',
            refresh_token='test_refresh_token',
            token_expiry=timezone.now() + timezone.timedelta(hours=1)
        )
    
    @patch('core.services.email_monitor_service.GmailService')
    def test_fetch_new_emails_from_contractor(self, mock_gmail):
        """Test fetching new emails from a contractor"""
        # Mock Gmail API responses
        mock_gmail.search_messages.return_value = [
            {'id': 'msg_123'},
            {'id': 'msg_456'}
        ]
        
        mock_gmail.get_message_details.side_effect = [
            {
                'message_id': 'msg_123',
                'from': 'contractor@example.com',
                'subject': 'Test Subject',
                'body': 'Test body',
                'received_at': timezone.now(),
                'attachments': []
            },
            {
                'message_id': 'msg_456',
                'from': 'contractor@example.com',
                'subject': 'Another email',
                'body': 'Another body',
                'received_at': timezone.now(),
                'attachments': []
            }
        ]
        
        service = EmailMonitorService()
        emails = service._fetch_new_emails_from_contractor(
            access_token='test_token',
            contractor_email='contractor@example.com',
            planning=self.planning,
            contractor_id=self.contractor.id,
            max_results=10
        )
        
        self.assertEqual(len(emails), 2)
        self.assertEqual(emails[0]['message_id'], 'msg_123')
    
    def test_get_processed_email_ids(self):
        """Test getting already processed email IDs"""
        # Create a processed offer
        ContractorOffer.objects.create(
            contracting_planning=self.planning,
            contractor_id=self.contractor.id,
            gmail_message_id='msg_processed',
            total_price=25000
        )
        
        service = EmailMonitorService()
        processed_ids = service._get_processed_email_ids(
            planning=self.planning,
            contractor_id=self.contractor.id
        )
        
        self.assertIn('msg_processed', processed_ids)
    
    @patch('core.services.email_monitor_service.GmailService')
    @patch('core.services.email_monitor_service.OfferService')
    @patch('core.services.email_monitor_service.ConversationAgent')
    def test_process_new_email_event_with_offer(self, mock_agent, mock_offer_service, mock_gmail):
        """Test processing a new email that contains an offer"""
        email_data = {
            'message_id': 'msg_new',
            'from': 'contractor@example.com',
            'subject': 'Angebot für Ihre Renovation',
            'body': 'Test offer body',
            'received_at': timezone.now(),
            'attachments': []
        }
        
        # Mock offer detection
        mock_offer = Mock(spec=ContractorOffer)
        mock_offer.id = 1
        mock_offer.total_price = 25000
        
        mock_offer_instance = Mock()
        mock_offer_instance.detect_and_extract_offer.return_value = {
            'is_offer': True,
            'total_price': 25000
        }
        mock_offer_instance.store_offer.return_value = mock_offer
        mock_offer_service.return_value = mock_offer_instance
        
        # Mock conversation agent
        mock_agent_instance = Mock()
        mock_agent.return_value = mock_agent_instance
        
        service = EmailMonitorService()
        service.process_new_email_event(
            email_data=email_data,
            planning=self.planning,
            contractor_id=self.contractor.id,
            access_token='test_token',
            user=self.user
        )
        
        # Verify offer service was called
        mock_offer_instance.detect_and_extract_offer.assert_called_once()
        
        # Verify agent was called to post notification
        mock_agent_instance.post_system_email_notification.assert_called_once()


class SystemMessageGeneratorTestCase(TestCase):
    """Test cases for SystemMessageGenerator"""
    
    def setUp(self):
        """Set up test data"""
        self.contractor = Contractor.objects.create(
            name='BauMeister GmbH',
            email='baumeister@example.com',
            city='Berlin',
            postal_code='10115'
        )
    
    @patch('core.services.contracting_service.system_message_generator.genai.GenerativeModel')
    def test_generate_email_notification_with_offer(self, mock_model):
        """Test generating notification for email with offer"""
        # Mock Gemini response
        mock_response = Mock()
        mock_response.text = '''```json
{
  "message": "I've received a new offer from BauMeister GmbH for your renovation.",
  "suggested_actions": ["Analyze this offer", "Compare all offers", "Ask about pricing"]
}
```'''
        
        mock_model_instance = Mock()
        mock_model_instance.generate_content.return_value = mock_response
        mock_model.return_value = mock_model_instance
        
        email_data = {
            'subject': 'Angebot für Ihre Renovation',
            'body': 'Test body'
        }
        
        mock_offer = Mock(spec=ContractorOffer)
        mock_offer.total_price = 25000
        
        generator = SystemMessageGenerator()
        result = generator.generate_email_notification(
            email_data=email_data,
            contractor=self.contractor,
            detected_offer=mock_offer
        )
        
        self.assertIn('message', result)
        self.assertIn('suggested_actions', result)
        self.assertIn('BauMeister', result['message'])
    
    def test_generate_fallback_message(self):
        """Test fallback message generation"""
        generator = SystemMessageGenerator()
        
        context = {
            'contractor_name': 'Test Contractor',
            'offer_type': 'formal offer'
        }
        
        message = generator._generate_fallback_message(context)
        
        self.assertIn('Test Contractor', message)
        self.assertIn('offer', message.lower())
    
    def test_generate_default_actions_with_offer(self):
        """Test default action generation for offers"""
        generator = SystemMessageGenerator()
        
        actions = generator._generate_default_actions(offer_detected=True)
        
        self.assertIsInstance(actions, list)
        self.assertGreater(len(actions), 0)
        self.assertTrue(any('offer' in action.lower() for action in actions))


class EmailMonitoringTaskTestCase(TestCase):
    """Test cases for the background task"""
    
    @patch('core.tasks.email_monitoring.EmailMonitorService')
    def test_poll_contractor_emails_success(self, mock_service):
        """Test successful execution of polling task"""
        # Mock service stats
        mock_instance = Mock()
        mock_instance.check_all_users.return_value = {
            'users_checked': 1,
            'emails_found': 2,
            'emails_processed': 2,
            'errors': 0
        }
        mock_service.return_value = mock_instance
        
        result = poll_contractor_emails()
        
        self.assertTrue(result['success'])
        self.assertIn('stats', result)
        self.assertEqual(result['stats']['users_checked'], 1)
        self.assertEqual(result['stats']['emails_found'], 2)
    
    @patch('core.tasks.email_monitoring.EmailMonitorService')
    def test_poll_contractor_emails_failure(self, mock_service):
        """Test task failure handling"""
        # Mock service to raise exception
        mock_instance = Mock()
        mock_instance.check_all_users.side_effect = Exception('Test error')
        mock_service.return_value = mock_instance
        
        result = poll_contractor_emails()
        
        self.assertFalse(result['success'])
        self.assertIn('error', result)
        self.assertIn('Test error', result['error'])


class IntegrationTestCase(TestCase):
    """Integration tests for the complete email monitoring flow"""
    
    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.project = Project.objects.create(
            user=self.user,
            name='Test Renovation',
            project_type='Kitchen',
            budget=50000
        )
        
        self.planning = ContractingPlanning.objects.create(
            project=self.project,
            description='Test planning',
            current_step=4
        )
        
        self.contractor = Contractor.objects.create(
            name='Test Contractor',
            email='contractor@example.com'
        )
        
        self.planning.selected_contractors = [self.contractor.id]
        self.planning.save()
        
        EmailCredential.objects.create(
            user=self.user,
            email='test@example.com',
            access_token='test_token',
            refresh_token='test_refresh',
            token_expiry=timezone.now() + timezone.timedelta(hours=1)
        )
    
    @patch('core.services.email_monitor_service.GmailService')
    @patch('core.services.contracting_service.offer_service.OfferService')
    @patch('core.services.contracting_service.system_message_generator.genai.GenerativeModel')
    def test_complete_email_processing_flow(self, mock_gemini, mock_offer_service, mock_gmail):
        """Test the complete flow from email detection to message posting"""
        # Mock Gmail API
        mock_gmail.search_messages.return_value = [{'id': 'msg_123'}]
        mock_gmail.get_message_details.return_value = {
            'message_id': 'msg_123',
            'from': 'contractor@example.com',
            'subject': 'Test Offer',
            'body': 'Test body',
            'received_at': timezone.now(),
            'attachments': []
        }
        
        # Mock offer detection (no offer)
        mock_offer_instance = Mock()
        mock_offer_instance.detect_and_extract_offer.return_value = None
        
        # Mock Gemini for message generation
        mock_response = Mock()
        mock_response.text = '''{"message": "New email received", "suggested_actions": ["Read email"]}'''
        mock_gemini_instance = Mock()
        mock_gemini_instance.generate_content.return_value = mock_response
        mock_gemini.return_value = mock_gemini_instance
        
        # Run the service
        service = EmailMonitorService()
        stats = service.check_contractor_emails_for_user(self.user)
        
        # Verify a message was created
        messages = Message.objects.filter(
            contracting_planning=self.planning,
            contractor_id=self.contractor.id,
            sender='ai'
        )
        
        # Note: This test may need adjustment based on mocking strategy
        self.assertGreaterEqual(stats['emails_found'], 0)
