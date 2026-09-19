"""
Quick verification script to test lat/long Point-in-Polygon (PIP) routing
and Gazette v1 -> v2 boundary shift logic.
"""
import sys
from pathlib import Path

# Add app to path
sys.path.append(str(Path(__file__).resolve().parent))

from app.services.spatial_engine import find_jurisdiction

def test_pip_routing():
    print("==================================================")
    print(" JurisShift Spatial Engine PIP Routing Test ")
    print("==================================================\n")

    test_points = [
        {"name": "Mysore Palace (Core City)", "lat": 12.3050, "lng": 76.6550},
        {"name": "Hootagalli Signal (North West)", "lat": 12.3600, "lng": 76.5800},
        {"name": "Bogadi Ring Road Junction (Buffer Area)", "lat": 12.3105, "lng": 76.6012},
        {"name": "Outskirts (Unassigned Zone)", "lat": 12.1000, "lng": 76.4000},
    ]

    for pt in test_points:
        res_v1 = find_jurisdiction(pt["lat"], pt["lng"], version="v1")
        res_v2 = find_jurisdiction(pt["lat"], pt["lng"], version="v2")

        print(f"Location: {pt['name']} ({pt['lat']}, {pt['lng']})")
        print(f"   - Under Gazette v1: {res_v1['ulb_name']} ({res_v1['ulb_code']})")
        print(f"   - Under Gazette v2: {res_v2['ulb_name']} ({res_v2['ulb_code']})")
        
        if res_v1['ulb_code'] != res_v2['ulb_code']:
            print(f"   >> JURISDICTION SHIFT DETECTED! {res_v1['ulb_name']} -> {res_v2['ulb_name']}")
        else:
            print("   -> Boundary unchanged.")
        print("-" * 50)

if __name__ == "__main__":
    test_pip_routing()
