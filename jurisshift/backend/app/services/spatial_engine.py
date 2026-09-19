import json
from pathlib import Path
from typing import Dict, Any, Optional, Tuple
from shapely.geometry import shape, Point
from app.config import BOUNDARIES_V1_PATH, BOUNDARIES_V2_PATH

class SpatialEngine:
    def __init__(self):
        self._boundaries_cache: Dict[str, Dict[str, Any]] = {}
        self._polygons_cache: Dict[str, list] = {}

    def load_boundaries(self, version: str = "v1") -> Dict[str, Any]:
        if version in self._boundaries_cache:
            return self._boundaries_cache[version]

        path = BOUNDARIES_V2_PATH if version == "v2" else BOUNDARIES_V1_PATH
        if not path.exists():
            raise FileNotFoundError(f"Boundary file not found at {path}")

        with open(path, "r", encoding="utf-8") as f:
            geojson_data = json.load(f)

        features = geojson_data.get("features", [])
        parsed_polygons = []
        for feat in features:
            geom = shape(feat["geometry"])
            parsed_polygons.append({
                "geometry": geom,
                "properties": feat["properties"]
            })

        self._boundaries_cache[version] = geojson_data
        self._polygons_cache[version] = parsed_polygons
        return geojson_data

    def find_jurisdiction(self, latitude: float, longitude: float, version: str = "v1") -> Dict[str, Any]:
        """
        Performs Shapely Point-in-Polygon matching.
        Note: GeoJSON coordinates are [longitude, latitude].
        """
        self.load_boundaries(version)
        point = Point(longitude, latitude)
        polygons = self._polygons_cache.get(version, [])

        for item in polygons:
            geom = item["geometry"]
            if geom.contains(point) or geom.touches(point):
                props = item["properties"]
                return {
                    "ulb_code": props.get("ulb_code"),
                    "ulb_name": props.get("ulb_name"),
                    "ulb_type": props.get("ulb_type"),
                    "district": props.get("district", "Mysuru"),
                    "state": props.get("state", "Karnataka"),
                    "contact_helpline": props.get("contact_helpline", ""),
                    "matched": True,
                    "version": version
                }

        # Fallback if coordinate falls outside all defined ULB boundaries
        return {
            "ulb_code": "ULB-DIST-99",
            "ulb_name": "District Administration (Unassigned Outer Zone)",
            "ulb_type": "District Jurisdiction",
            "district": "Mysuru",
            "state": "Karnataka",
            "contact_helpline": "0821-2422100",
            "matched": False,
            "version": version
        }

spatial_engine = SpatialEngine()

def find_jurisdiction(lat: float, lng: float, version: str = "v1") -> Dict[str, Any]:
    return spatial_engine.find_jurisdiction(lat, lng, version)
