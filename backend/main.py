from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import get_connection

app = FastAPI(
    title="Water Utility GIS API",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://water-utility-gis.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# Models
# -----------------------------

class Hydrant(BaseModel):
    assetId: str
    longitude: float
    latitude: float
    status: str
    inspectionDate: str
    flowRatingGpm: int


class Valve(BaseModel):
    assetId: str
    longitude: float
    latitude: float
    valveType: str
    status: str
    installYear: int


class WaterMain(BaseModel):
    assetId: str
    paths: list[list[list[float]]]
    diameter: int
    material: str
    installYear: int
    condition: str
    status: str

class ServiceZone(BaseModel):
    zoneId: str
    zoneName: str
    status: str
    rings: list[list[list[float]]]
    
    
# -----------------------------
# Simulated data
# -----------------------------

hydrants = [
    Hydrant(
        assetId="HYD-001",
        longitude=-98.4936,
        latitude=29.4241,
        status="Active",
        inspectionDate="2026-03-12",
        flowRatingGpm=1250,
    ),
    Hydrant(
        assetId="HYD-002",
        longitude=-98.4870,
        latitude=29.4280,
        status="Inspection Due",
        inspectionDate="2025-08-04",
        flowRatingGpm=980,
    ),
    Hydrant(
        assetId="HYD-003",
        longitude=-98.4902,
        latitude=29.4210,
        status="Active",
        inspectionDate="2026-01-19",
        flowRatingGpm=1100,
    ),
    Hydrant(
        assetId="HYD-004",
        longitude=-98.4848,
        latitude=29.4255,
        status="Active",
        inspectionDate="2026-05-08",
        flowRatingGpm=1400,
    ),
    Hydrant(
        assetId="HYD-005",
        longitude=-98.4990,
        latitude=29.4260,
        status="Inspection Due",
        inspectionDate="2025-07-15",
        flowRatingGpm=900,
    ),
]


valves = [
    Valve(
        assetId="VALVE-001",
        longitude=-98.4965,
        latitude=29.4230,
        valveType="Gate Valve",
        status="Open",
        installYear=2016,
    ),
    Valve(
        assetId="VALVE-002",
        longitude=-98.4870,
        latitude=29.4280,
        valveType="Butterfly",
        status="Open",
        installYear=2019,
    ),
    Valve(
        assetId="VALVE-003",
        longitude=-98.4905,
        latitude=29.4205,
        valveType="Gate Valve",
        status="Open",
        installYear=2011,
    ),
    Valve(
        assetId="VALVE-004",
        longitude=-98.4848,
        latitude=29.4255,
        valveType="Gate Valve",
        status="Maintenance Due",
        installYear=2005,
    ),
    Valve(
        assetId="VALVE-005",
        longitude=-98.4990,
        latitude=29.4260,
        valveType="Butterfly",
        status="Open",
        installYear=2021,
    ),
]


water_mains = [
    WaterMain(
        assetId="MAIN-001",
        paths=[
            [
                [-98.5005, 29.4205],
                [-98.4965, 29.4230],
                [-98.4936, 29.4241],
                [-98.4870, 29.4280],
                [-98.4815, 29.4310],
            ]
        ],
        diameter=12,
        material="PVC",
        installYear=2014,
        condition="Good",
        status="Active",
    ),
    WaterMain(
        assetId="MAIN-002",
        paths=[
            [
                [-98.4936, 29.4241],
                [-98.4905, 29.4205],
                [-98.4865, 29.4175],
            ]
        ],
        diameter=8,
        material="Ductile Iron",
        installYear=2008,
        condition="Fair",
        status="Active",
    ),
    WaterMain(
        assetId="MAIN-003",
        paths=[
            [
                [-98.4965, 29.4230],
                [-98.4990, 29.4260],
                [-98.5015, 29.4290],
            ]
        ],
        diameter=10,
        material="Cast Iron",
        installYear=1987,
        condition="Poor",
        status="Inspection Due",
    ),
    WaterMain(
        assetId="MAIN-004",
        paths=[
            [
                [-98.4870, 29.4280],
                [-98.4848, 29.4255],
                [-98.4820, 29.4230],
            ]
        ],
        diameter=6,
        material="PVC",
        installYear=2018,
        condition="Good",
        status="Active",
    ),
    
    
]

service_zones = [
    ServiceZone(
        zoneId="ZONE-01",
        zoneName="Central Service Zone",
        status="Normal",
        rings=[
            [
                [-98.5050, 29.4170],
                [-98.4780, 29.4170],
                [-98.4780, 29.4350],
                [-98.5050, 29.4350],
                [-98.5050, 29.4170],
            ]
        ],
    ),
]

# -----------------------------
# Routes
# -----------------------------

@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/api/hydrants", response_model=list[Hydrant])
def get_hydrants():
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                asset_id,
                status,
                inspection_date,
                flow_rating_gpm,
                ST_X(geom) AS longitude,
                ST_Y(geom) AS latitude
                FROM hydrants
                ORDER BY asset_id;
                """
            )

            rows = cursor.fetchall()

            return [
        Hydrant(
            assetId=row["asset_id"],
            longitude=row["longitude"],
            latitude=row["latitude"],
            status=row["status"],
            inspectionDate=row["inspection_date"].isoformat(),
            flowRatingGpm=row["flow_rating_gpm"],
        )
        for row in rows
    ]


@app.get("/api/valves", response_model=list[Valve])
def get_valves():
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                asset_id,
                valve_type,
                status,
                install_year,
                ST_X(geom) AS longitude,
                ST_Y(geom) AS latitude
                FROM valves
                ORDER BY asset_id;
                """
            )

            rows = cursor.fetchall()

            return [
        Valve(
            assetId=row["asset_id"],
            longitude=row["longitude"],
            latitude=row["latitude"],
            valveType=row["valve_type"],
            status=row["status"],
            installYear=row["install_year"],
        )
        for row in rows
    ]


@app.get("/api/water-mains", response_model=list[WaterMain])
def get_water_mains():
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                asset_id,
                diameter,
                material,
                install_year,
                condition,
                status,
                ST_AsGeoJSON(geom)::json AS geometry
                FROM water_mains
                ORDER BY asset_id;
                """
            )

            rows = cursor.fetchall()

            return [
        WaterMain(
            assetId=row["asset_id"],
            paths=[row["geometry"]["coordinates"]],
            diameter=row["diameter"],
            material=row["material"],
            installYear=row["install_year"],
            condition=row["condition"],
            status=row["status"],
        )
        for row in rows
    ]

@app.get("/api/service-zones", response_model=list[ServiceZone])
def get_service_zones():
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                zone_id,
                zone_name,
                status,
                ST_AsGeoJSON(geom)::json AS geometry
                FROM service_zones
                ORDER BY zone_id;
                """
            )

            rows = cursor.fetchall()

            return [
        ServiceZone(
            zoneId=row["zone_id"],
            zoneName=row["zone_name"],
            status=row["status"],
            rings=row["geometry"]["coordinates"],
        )
        for row in rows
    ]