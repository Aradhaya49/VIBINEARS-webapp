import math


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Return distance in metres between two WGS-84 coordinates."""
    R = 6_371_000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def bounding_box(lat: float, lon: float, radius_m: float):
    """Return (lat_min, lat_max, lon_min, lon_max) for a radius in metres."""
    deg = radius_m / 111_000
    return lat - deg, lat + deg, lon - deg, lon + deg
