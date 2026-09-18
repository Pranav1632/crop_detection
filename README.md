# CropDetect AI 🌿
### Automated Crop Identification, Disease Diagnosis & Agronomic Advisory System

[![Python 3.13](https://img.shields.io/badge/Python-3.13-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.129-009688.svg)](https://fastapi.tiangolo.com/)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4-38bdf8.svg)](https://tailwindcss.com/)
[![Validation Accuracy](https://img.shields.io/badge/Val_Accuracy-98.51%25-brightgreen.svg)]()

**CropDetect AI** is an industrial-grade, full-stack deep learning application for precision agriculture. Powered by an **EfficientNet-B0** model achieving **98.51% validation accuracy** across **38 plant pathologies**, it provides instantaneous crop identification, disease severity classification, explainable visual heatmaps (**Grad-CAM**), and actionable treatment protocols (organic, chemical, and preventative).

---

## 🌟 Key Features

- **Live Smartphone & Webcam Camera**: Capture photos directly in the field using `navigator.mediaDevices.getUserMedia` with mobile rear-facing camera support (`facingMode: "environment"`), flash animations, and target framing guides.
- **Image Quality & Blur Detection**: Real-time Laplacian variance blur analysis and illumination auditing alert farmers if a photo is out of focus or poorly lit before processing.
- **Explainable AI (Grad-CAM)**: Visual attention heatmaps highlight the exact lesion patterns and fungal colonies that triggered the AI's diagnosis, featuring an interactive opacity slider and side-by-side comparative views.
- **Comprehensive Agronomic Knowledge Base**: Every diagnosis includes detailed disease profiles, severity rankings, pathogen classifications, and actionable action plans divided into:
  - 🌿 **Organic & Biological Remedies** (neem oil, Trichoderma, Bacillus subtilis)
  - 🧪 **Chemical / Conventional Controls** (targeted active ingredients, spray schedules)
  - 🛡️ **Field Prevention & Hygiene** (drip irrigation, canopy aeration, resistant seeds)
- **High-Throughput Serving**: Asynchronous **FastAPI** backend with automatic OpenAPI/Swagger documentation (`/docs`).
- **Modern Full-Stack Architecture**: Responsive Next.js 16 frontend built with **pnpm**, React 19, Tailwind CSS v4, and Lucide Icons.

---

## 🏗️ Architecture

```
cropdetect/
├── app/                        # FastAPI Serving Layer
│   ├── api.py                  # Endpoints (/health, /classes, /predict)
│   └── schemas.py              # Pydantic v2 Request/Response validation
├── src/                        # Core AI & Image Processing Engine
│   ├── config.py               # Hyperparameters, paths, and thresholds
│   ├── preprocessing.py        # Image decoding, normalization, and blur checks
│   ├── model_loader.py         # Singleton model caching & weight management
│   ├── gradcam.py              # Grad-CAM heatmap generation & visual blending
│   └── predictor.py            # Unified inference & knowledge base pipeline
├── data/
│   └── disease_info.json       # Curated 38-class agronomic treatment database
├── models/
│   ├── crop_model.keras        # Trained EfficientNet-B0 model weights (98.51% accuracy)
│   ├── class_names.json        # Canonical 38 class mapping
│   ├── config.json             # Keras 3 model topology
│   └── model.weights.h5        # Model weights
├── frontend/                   # Next.js 16 Web Client (pnpm)
│   ├── src/
│   │   ├── app/                # Next.js App Router (page.tsx, layout.tsx)
│   │   ├── components/         # CameraCapture, GradCamViewer, DiagnosisCard, etc.
│   │   ├── lib/api.ts          # FastAPI HTTP client
│   │   └── types/index.ts      # TypeScript interfaces
│   └── package.json
├── tests/                      # Automated Test Suite (pytest)
│   ├── test_full_suite.py
│   └── test_api.py
├── run.py                      # Master service launcher
└── README.md
```

---

## 🚀 Quick Start

### 1. Prerequisites
- Python 3.10+ (tested on Python 3.13)
- Node.js 20+ & `pnpm` (`npm i -g pnpm`)

### 2. Backend Setup
Install Python dependencies:
```bash
pip install tensorflow keras fastapi uvicorn pillow opencv-python pydantic pytest httpx
```

### 3. Frontend Setup
```bash
cd frontend
pnpm install
cd ..
```

### 4. Run Application
Launch both backend and frontend with a single command:
```bash
python run.py dev
```
Or start services individually:
- **FastAPI Backend only**: `python run.py api` (runs on `http://localhost:8000`)
- **Next.js Frontend only**: `python run.py ui` (runs on `http://localhost:3000`)

Access the interfaces:
- 🌐 **Web Application**: [http://localhost:3000](http://localhost:3000)
- 📜 **Interactive API Docs (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- 🩺 **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

## 🧪 Testing

Run the full automated test suite covering model inference, Grad-CAM generation, knowledge base validation, image quality audits, and API endpoints:
```bash
pytest tests/test_full_suite.py -v
```

---

## 📊 Supported Crops & Pathologies (38 Classes)

- **Apple**: Scab, Black Rot, Cedar Apple Rust, Healthy
- **Blueberry**: Healthy
- **Cherry**: Powdery Mildew, Healthy
- **Corn (Maize)**: Gray Leaf Spot, Common Rust, Northern Leaf Blight, Healthy
- **Grape**: Black Rot, Esca (Black Measles), Leaf Blight, Healthy
- **Orange**: Citrus Greening (Huanglongbing)
- **Peach**: Bacterial Spot, Healthy
- **Pepper (Bell)**: Bacterial Spot, Healthy
- **Potato**: Early Blight, Late Blight, Healthy
- **Raspberry**: Healthy
- **Soybean**: Healthy
- **Squash**: Powdery Mildew
- **Strawberry**: Leaf Scorch, Healthy
- **Tomato**: Bacterial Spot, Early Blight, Late Blight, Leaf Mold, Septoria Leaf Spot, Spider Mites, Target Spot, Yellow Leaf Curl Virus, Mosaic Virus, Healthy

---

## 📄 License
MIT License. Free for agricultural research, academic, and commercial precision farming applications.
