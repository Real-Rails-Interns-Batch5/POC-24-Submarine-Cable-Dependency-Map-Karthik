from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routers import cables, ownership, network, simulation
from backend.services.data_loader import DataLoader

app = FastAPI(
    title="Real Rails Infrastructure Intelligence API",
    description="Production‑ready backend for the Submarine Cable Intelligence platform",
    version="1.0.0",
)

# ---------- CORS ----------
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Routers ----------
app.include_router(cables.router, prefix="/cables", tags=["Cables"])
app.include_router(ownership.router, prefix="/owners", tags=["Owners"])
app.include_router(network.router, prefix="/network", tags=["Network"])
app.include_router(simulation.router, prefix="/simulation", tags=["Simulation"])

# ---------- Root & health ----------
@app.get("/", tags=["Root"])
async def root():
    return {"message": "Real Rails Infrastructure Intelligence API"}

@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy"}

# ---------- Startup ----------
@app.on_event("startup")
async def startup_event():
    # Load all JSON data into the in‑memory cache
    DataLoader.load_all()
