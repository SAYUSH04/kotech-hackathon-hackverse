from rest_framework import serializers
from .models import TrafficReport
from .models import AmbulanceAlert

class TrafficReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrafficReport
        fields = '__all__'

class AmbulanceAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = AmbulanceAlert
        fields = '__all__'