from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TrafficReportViewSet,
    AnalyzeImageAPIView,
    get_congestion_blocks,
    get_all_issues,
    AmbulanceAlertViewSet,  # ✅ include this
)

router = DefaultRouter()
router.register(r'reports', TrafficReportViewSet)
router.register(r'ambulance-alerts', AmbulanceAlertViewSet) 

urlpatterns = [
    path('', include(router.urls)),
    path('analyze-image/', AnalyzeImageAPIView.as_view(), name='analyze-image'),
    path('congestion-blocks/', get_congestion_blocks, name='get-congestion-blocks'),
    path('all-issues/', get_all_issues, name='all-issues'),
    path('all-issues/', get_all_issues, name='all-issues'),

]
