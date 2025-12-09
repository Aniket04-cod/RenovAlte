from rest_framework import serializers


class ChatMessageSerializer(serializers.Serializer):
	message = serializers.CharField(required=True)
	session_id = serializers.CharField(required=False, allow_blank=True)


class ChatResponseSerializer(serializers.Serializer):
	response = serializers.CharField()
	session_id = serializers.CharField()
