from rest_framework import viewsets
from .models import TrafficReport
from .serializers import TrafficReportSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .utils.analyze_image import analyze_traffic_image  # your custom logic
from PIL import Image
import io
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import TrafficReport
from .serializers import TrafficReportSerializer
from rest_framework import viewsets
from .models import AmbulanceAlert
from .serializers import AmbulanceAlertSerializer

class TrafficReportViewSet(viewsets.ModelViewSet):
    queryset = TrafficReport.objects.all().order_by('-reported_at')
    serializer_class = TrafficReportSerializer

class AnalyzeImageAPIView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request, *args, **kwargs):
        image_file = request.FILES.get('image')
        if not image_file:
            return Response({'error': 'No image provided'}, status=400)

        try:
            # Convert to PIL Image
            image = Image.open(image_file)
            
            # Analyze congestion
            level = analyze_traffic_image(image)
            
            return Response({'congestion_level': level})
            
        except Exception as e:
            return Response({'error': str(e)}, status=500)


@api_view(['GET'])
def get_congestion_blocks(request):
    blocks = TrafficReport.objects.filter(issue_type="Block")
    data = [
        {
            'id': block.id,
            "issue_type": "Block",
            'location': block.location,
            'coords': [block.longitude, block.latitude],
            'level': block.level
        } for block in blocks
    ]
    return Response(data)

@api_view(['GET'])
def get_all_issues(request):
    reports = TrafficReport.objects.all()
    serializer = TrafficReportSerializer(reports, many=True)
    return Response(serializer.data)

class AmbulanceAlertViewSet(viewsets.ModelViewSet):
    queryset = AmbulanceAlert.objects.all()
    serializer_class = AmbulanceAlertSerializer

@api_view(['GET'])
def get_ambulance_alerts(request):
    alerts = AmbulanceAlert.objects.all().order_by('-timestamp')
    data = AmbulanceAlertSerializer(alerts, many=True).data
    return Response(data)