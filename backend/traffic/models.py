from django.db import models

class TrafficReport(models.Model):
    ISSUE_CHOICES = [
        ('Block', 'Block'),
        ('Accident', 'Accident'),
        ('Pothole', 'Pothole'),
        ('Other', 'Other'),
    ]
    LEVEL_CHOICES = [
        ('High', 'High'),
        ('Medium', 'Medium'),
        ('Low', 'Low'),
    ]

    issue_type = models.CharField(max_length=20, choices=ISSUE_CHOICES)
    location = models.CharField(max_length=100, blank=True)  # Place name
    level = models.CharField(max_length=10, choices=LEVEL_CHOICES, blank=True)
    description = models.TextField(blank=True)
    latitude = models.FloatField()
    longitude = models.FloatField()
    reported_at = models.DateTimeField(auto_now_add=True)



class AmbulanceAlert(models.Model):
    from_place = models.CharField(max_length=200)
    to_place = models.CharField(max_length=200)
    from_lat = models.FloatField()
    from_lng = models.FloatField()
    to_lat = models.FloatField()
    to_lng = models.FloatField()
    timestamp = models.DateTimeField(auto_now_add=True)
