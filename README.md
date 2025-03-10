# Pricing Calculator

A simple Flask application for calculating VR headset pricing.

## Setup Instructions

### Prerequisites
- Python 3.7 or higher
- pip (Python package manager)

### Installation

1. Clone this repository:
```
git clone https://github.com/yourusername/pricing-calc.git
cd pricing-calc
```

2. Create a virtual environment (optional but recommended):
```
python -m venv venv
```

3. Activate the virtual environment:
   - On Windows:
   ```
   venv\Scripts\activate
   ```
   - On macOS/Linux:
   ```
   source venv/bin/activate
   ```

4. Install the required packages:
```
pip install -r requirements.txt
```

### Running the Application

#### Option 1: Using the run.py script
Simply execute:
```
python run.py
```
This script will automatically check and install dependencies if needed, then start the server.

#### Option 2: Running app.py directly
```
python app.py
```

Then open your web browser and navigate to:
```
http://localhost:5001
```

### Notes
- The application runs on port 5001 to avoid conflicts with other services
- You can modify the port in app.py if needed
