import json
from io import BytesIO
from urllib.error import URLError

import pytest
from fastapi import HTTPException

from backend.config import RoutingSettings
from backend.services.routing import ValhallaClient


def test_provider_request_and_invalid_geometry(monkeypatch):
    from backend.services import routing
    captured = {}

    def respond(request, timeout, context):
        captured.update(json.loads(request.data))
        return BytesIO(json.dumps({"code": "Ok", "routes": [{
            "distance": 1200, "duration": 800,
            "geometry": {"type": "LineString", "coordinates": [[49.1, 55.7], [49.2, 55.8]]},
        }]}).encode())

    monkeypatch.setattr(routing, "urlopen", respond)
    result = ValhallaClient().calculate([(55.7, 49.1), (55.8, 49.2)])
    assert result.distance == 1200
    assert captured["costing"] == "pedestrian"
    assert captured["shape_format"] == "geojson"
    assert captured["locations"][0] == {"lat": 55.7, "lon": 49.1, "type": "break"}

    monkeypatch.setattr(routing, "urlopen", lambda *args, **kwargs: BytesIO(b'{"code":"Ok","routes":[]}'))
    with pytest.raises(HTTPException) as error:
        ValhallaClient().calculate([(55, 49), (56, 49)])
    assert error.value.status_code == 502


def test_provider_outage(monkeypatch):
    from backend.services import routing

    def unavailable(*args, **kwargs):
        raise URLError("offline")

    monkeypatch.setattr(routing, "urlopen", unavailable)
    with pytest.raises(HTTPException) as error:
        ValhallaClient(RoutingSettings(_env_file=None)).calculate([(55, 49), (56, 49)])
    assert error.value.status_code == 503
