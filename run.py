import argparse
import subprocess
import sys
import os
import time

def start_backend():
    print("🌱 Starting FastAPI Backend Service on http://127.0.0.1:8000 ...")
    cmd = [
        sys.executable,
        "-m",
        "uvicorn",
        "app.api:app",
        "--host",
        "0.0.0.0",
        "--port",
        "8000",
        "--reload"
    ]
    return subprocess.Popen(cmd)

def start_frontend():
    print("💻 Starting Next.js Frontend on http://localhost:3000 (via pnpm) ...")
    frontend_dir = os.path.join(os.path.dirname(__file__), "frontend")
    # Use pnpm on Windows
    pnpm_cmd = "pnpm.cmd" if os.name == "nt" else "pnpm"
    cmd = [pnpm_cmd, "dev"]
    return subprocess.Popen(cmd, cwd=frontend_dir)

def main():
    parser = argparse.ArgumentParser(description="CropDetect AI Project Launcher")
    parser.add_argument(
        "service",
        choices=["dev", "api", "ui"],
        default="dev",
        nargs="?",
        help="Service to run: 'api' for FastAPI backend, 'ui' for Next.js, or 'dev' for both (default)"
    )
    args = parser.parse_args()

    processes = []
    try:
        if args.service in ["dev", "api"]:
            p_api = start_backend()
            processes.append(p_api)
            time.sleep(2)

        if args.service in ["dev", "ui"]:
            p_ui = start_frontend()
            processes.append(p_ui)

        print("\n" + "=" * 60)
        print("🚀 CropDetect AI is actively running!")
        if args.service in ["dev", "api"]:
            print(" - FastAPI Swagger Docs:  http://localhost:8000/docs")
            print(" - API Health Check:     http://localhost:8000/health")
        if args.service in ["dev", "ui"]:
            print(" - Next.js Web App:      http://localhost:3000")
        print("=" * 60)
        print("Press Ctrl+C to terminate all services.\n")

        for p in processes:
            p.wait()

    except KeyboardInterrupt:
        print("\nGracefully shutting down services...")
        for p in processes:
            p.terminate()
        sys.exit(0)

if __name__ == "__main__":
    main()
