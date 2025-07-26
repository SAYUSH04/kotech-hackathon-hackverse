"""
Simple traffic congestion analysis utility
File: utils/analyze_image.py
"""

from ultralytics import YOLO
import numpy as np
import cv2
from PIL import Image

# Load YOLO model only once
model = YOLO('yolov8n.pt')  # Use yolov8n for fast inference, or yolov8s/m/l for better accuracy

def analyze_traffic_image(image_path_or_file):
    """
    Analyze traffic congestion in an image
    
    Args:
        image_path_or_file: File path string or PIL Image object
        
    Returns:
        str: 'Low', 'Medium', or 'High' congestion level
    """

    try:
        # Handle both file path or PIL Image input
        if isinstance(image_path_or_file, str):
            pil_image = Image.open(image_path_or_file).convert('RGB')
        elif isinstance(image_path_or_file, Image.Image):
            pil_image = image_path_or_file.convert('RGB')
        else:
            # Handle Django uploaded files
            if hasattr(image_path_or_file, 'read'):
                pil_image = Image.open(image_path_or_file).convert('RGB')
            else:
                raise ValueError("Unsupported image input type.")

        # Convert to OpenCV format (numpy BGR)
        img_cv = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)

        # Run detection
        results = model.predict(img_cv, imgsz=640, conf=0.25, verbose=False)

        # Check if any detections were made
        if not results or results[0].boxes is None or len(results[0].boxes) == 0:
            return 'Low'

        result = results[0]

        # COCO class IDs for vehicles and traffic-relevant objects
        vehicle_class_ids = {2, 3, 5, 7}  # car, motorcycle, bus, truck
        traffic_relevant_ids = {0, 1, 2, 3, 5, 7}  # person, bicycle, car, motorcycle, bus, truck

        vehicle_count = 0
        total_relevant = 0
        detected_objects = {}

        # Process detections
        for cls_tensor in result.boxes.cls:
            cls_id = int(cls_tensor.item())  # Convert tensor to int properly
            
            if cls_id in traffic_relevant_ids:
                total_relevant += 1
                
                # Count vehicles specifically
                if cls_id in vehicle_class_ids:
                    vehicle_count += 1
                
                # Track object types
                class_name = model.names.get(cls_id, f'class_{cls_id}')
                detected_objects[class_name] = detected_objects.get(class_name, 0) + 1

        # Determine congestion level using both vehicle count and total relevant objects
        congestion_level = determine_congestion_level(vehicle_count, total_relevant)

        return congestion_level

    except Exception as e:
        print(f"[ERROR] Image analysis failed: {e}")
        return 'Unknown'


def determine_congestion_level(vehicle_count, total_relevant):
    """
    Determine congestion level based on object counts
    
    Args:
        vehicle_count: Number of vehicles detected
        total_relevant: Total number of traffic-relevant objects
        
    Returns:
        str: 'Low', 'Medium', or 'High'
    """
    # Primary scoring based on vehicles, secondary on all relevant objects
    primary_score = vehicle_count
    secondary_score = total_relevant - vehicle_count  # pedestrians, bicycles, etc.
    
    # Weighted combined score
    combined_score = primary_score * 1.5 + secondary_score * 0.5
    
    # Adjust thresholds based on typical traffic scenarios
    if combined_score <= 6:
        return "Low"
    elif combined_score <= 18:
        return "Medium"
    else:
        return "High"


# Simple test function
def test_image_analysis(image_path):
    """Test the analysis function with debug output"""
    print(f"Analyzing: {image_path}")
    result = analyze_traffic_image(image_path)
    
    print(f"Congestion Level: {result['congestion_level']}")
    print(f"Vehicle Count: {result['vehicle_count']}")
    print(f"Total Objects: {result['total_objects']}")
    print(f"Detected Objects: {result['details'].get('detected_objects', {})}")
    
    return result