#!/usr/bin/env python
"""
Simple script to start the pricing calculator Flask application
"""
import subprocess
import sys
import os

def check_requirements():
    """Check if required packages are installed"""
    try:
        import flask
        print("Flask is already installed.")
        return True
    except ImportError:
        print("Flask is not installed. Installing requirements...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
            return True
        except subprocess.CalledProcessError:
            print("Failed to install requirements. Please install them manually:")
            print("pip install -r requirements.txt")
            return False

def run_app():
    """Run the Flask application"""
    if not check_requirements():
        return
    
    print("Starting Pricing Calculator on http://localhost:5001")
    print("Press Ctrl+C to stop the server.")
    
    try:
        subprocess.call([sys.executable, "app.py"])
    except KeyboardInterrupt:
        print("\nServer stopped.")

if __name__ == "__main__":
    run_app() 