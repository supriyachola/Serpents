# Serpents

# CO₂ Footprint Calculator (Web + AI)

Live Demo: [https://serpents-carbonaware.netlify.app/](https://serpents-carbonaware.netlify.app/)
https://github.com/supriyachola/Serpents

An interactive web application to **track, visualize, and reduce your carbon footprint**. Integrated with **FastAPI** and **Transformers-based AI** to provide personalized eco-friendly suggestions.



## 🔹 Features

- **Comprehensive Tracking:** Track transportation, energy usage, food, waste, and purchasing habits.
- **Smart AI Advice:** Get personalized recommendations from a GPT-2 AI model.
- **Charts & Visualization:** Category-wise breakdown for clear insights.
- **History & PDF Reports:** Save local results and download a printable summary.
- **Privacy-First:** All calculations run in your browser; data only sent to AI if requested.


---

## 🔹 Technologies Used

- **Frontend:** HTML, CSS, JavaScript, Chart.js, jsPDF
- **Backend:** Python, FastAPI, Pydantic
- **AI/ML:** Transformers (GPT-2) for eco-friendly advice
- **Tools:** GitHub, VS Code

---

## 🔹 Installation

1. Clone the repository:

```bash
git clone https://github.com/supriyachola/Serpents.git
cd Serpents
'''

pip install fastapi uvicorn transformers torch
uvicorn server:app --host 0.0.0.0 --port 8000 --reload

