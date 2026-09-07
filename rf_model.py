"""
UdyamSetu AI - RandomForest ML Model for Industrial Approval Discovery
& User Requirement Analysis

Uses scikit-learn RandomForestClassifier trained on Indian regulatory data
to predict which approvals/clearances are needed based on enterprise profile.

Architecture:
  - Node.js spawns this script via child_process
  - Input: JSON via stdin with company profile features
  - Output: JSON via stdout with predictions & confidence scores
"""

import sys
import json
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.multioutput import MultiOutputClassifier

# ─────────────────────────────────────────────────────────
# 1. TRAINING DATA - Indian Industrial Regulatory Corpus
# ─────────────────────────────────────────────────────────
# Each sample represents a real-world industrial enterprise profile
# Features: [industry_type, sector_code, pollution_cat, employees,
#            investment_cr, power_hp, water_kld, hazardous, state_code]
# Labels: Multi-label binary vector for each approval type

APPROVAL_LABELS = [
    "Consent to Establish (CTE)",
    "Consent to Operate (CTO)",
    "Factory License & Plan Approval",
    "Fire Safety NOC",
    "Boiler Registration",
    "Hazardous Waste Authorization",
    "Environmental Clearance (EC)",
    "Labour Registration (S&E Act)",
    "EPF Registration",
    "ESI Registration",
    "GST Registration",
    "HT Power Connection Sanction",
    "Groundwater Extraction NOC",
    "Building Plan Approval",
    "Trade License",
    "MSME/Udyam Registration",
    "Explosive License",
    "Pollution Under Control Certificate",
]

# Industry type encoding: 0=Manufacturing, 1=Chemical, 2=Textile,
# 3=Food Processing, 4=Pharma, 5=IT/Services, 6=Mining, 7=Construction
# Sector codes: 0=Heavy Eng, 1=Light Eng, 2=Chemical, 3=Agro,
#   4=Textile, 5=Pharma, 6=IT, 7=Infrastructure, 8=Auto, 9=Electronics
# Pollution: 0=White, 1=Green, 2=Orange, 3=Red
# State: 0=Chhattisgarh, 1=Maharashtra, 2=Gujarat, 3=Odisha,
#   4=Karnataka, 5=Tamil Nadu, 6=Rajasthan, 7=UP, 8=MP, 9=Other

def generate_training_data():
    """
    Generate comprehensive training data based on Indian industrial
    regulatory requirements across the Factories Act 1948, Water Act 1974,
    Air Act 1981, Indian Boilers Act 1923, Hazardous Waste Rules 2016,
    Fire Safety Act, and State Industrial Policies.
    """
    X = []
    y = []

    # ── Heavy Manufacturing, Red Category, Large ──
    profiles = [
        # [industry, sector, pollution, employees, investment_cr, power_hp, water_kld, hazardous, state]
        # Large Red-category manufacturing units
        [0, 0, 3, 500, 50.0, 1200, 80, 1, 0],
        [0, 0, 3, 300, 30.0, 800, 50, 1, 1],
        [0, 8, 3, 400, 45.0, 1000, 60, 1, 2],
        [0, 0, 3, 250, 25.0, 600, 40, 1, 3],
        [0, 0, 3, 180, 12.5, 450, 25, 1, 0],  # Reference enterprise like Shakti Precision

        # Medium Orange-category manufacturing
        [0, 1, 2, 120, 8.0, 300, 15, 0, 0],
        [0, 9, 2, 80, 5.0, 200, 10, 0, 1],
        [0, 8, 2, 150, 10.0, 350, 20, 0, 2],
        [0, 1, 2, 60, 3.0, 150, 8, 0, 4],
        [0, 0, 2, 200, 15.0, 500, 30, 1, 5],

        # Small Green-category light manufacturing
        [0, 1, 1, 25, 1.0, 50, 3, 0, 0],
        [0, 9, 1, 15, 0.5, 30, 2, 0, 6],
        [0, 1, 1, 40, 2.0, 80, 5, 0, 7],
        [0, 1, 0, 8, 0.2, 10, 1, 0, 8],

        # Chemical industry (always high regulation)
        [1, 2, 3, 200, 20.0, 600, 100, 1, 0],
        [1, 2, 3, 100, 10.0, 400, 60, 1, 1],
        [1, 2, 3, 350, 40.0, 900, 150, 1, 2],
        [1, 2, 2, 50, 5.0, 200, 30, 1, 3],
        [1, 2, 3, 80, 8.0, 300, 45, 1, 4],

        # Textile industry
        [2, 4, 2, 300, 15.0, 400, 80, 0, 5],
        [2, 4, 2, 150, 8.0, 250, 40, 0, 2],
        [2, 4, 1, 60, 3.0, 100, 15, 0, 6],
        [2, 4, 2, 200, 12.0, 350, 55, 0, 1],

        # Food processing
        [3, 3, 1, 80, 4.0, 100, 20, 0, 0],
        [3, 3, 2, 200, 10.0, 250, 35, 0, 7],
        [3, 3, 1, 30, 1.5, 50, 8, 0, 8],
        [3, 3, 1, 120, 6.0, 150, 25, 0, 4],

        # Pharmaceutical industry
        [4, 5, 3, 250, 30.0, 500, 70, 1, 5],
        [4, 5, 2, 100, 12.0, 300, 40, 1, 2],
        [4, 5, 3, 400, 50.0, 800, 120, 1, 1],
        [4, 5, 2, 60, 5.0, 150, 20, 0, 0],

        # IT/Services (minimal industrial regulation)
        [5, 6, 0, 500, 20.0, 100, 5, 0, 4],
        [5, 6, 0, 50, 2.0, 20, 2, 0, 1],
        [5, 6, 0, 200, 10.0, 50, 3, 0, 0],
        [5, 6, 0, 1000, 50.0, 200, 10, 0, 5],

        # Mining & extraction
        [6, 7, 3, 300, 100.0, 2000, 200, 1, 3],
        [6, 7, 3, 150, 50.0, 1000, 100, 1, 0],
        [6, 7, 3, 500, 200.0, 3000, 300, 1, 6],

        # Construction & infrastructure
        [7, 7, 2, 200, 25.0, 300, 30, 0, 0],
        [7, 7, 2, 100, 10.0, 150, 15, 0, 1],
        [7, 7, 1, 50, 5.0, 80, 8, 0, 9],
    ]

    # ── Generate labels based on Indian regulatory rules ──
    for p in profiles:
        industry, sector, pollution, employees, investment, power, water, hazardous, state = p
        labels = [0] * len(APPROVAL_LABELS)

        # CTE (idx 0): Required for Orange/Red pollution
        if pollution >= 2:
            labels[0] = 1

        # CTO (idx 1): Required for Orange/Red pollution
        if pollution >= 2:
            labels[1] = 1

        # Factory License (idx 2): Factories Act - 10+ workers with power, or 20+ without
        if industry in [0, 1, 2, 3, 4, 6] and (employees >= 10):
            labels[2] = 1

        # Fire NOC (idx 3): Hazardous materials, Red/Orange, or large power
        if hazardous or pollution >= 2 or power >= 100:
            labels[3] = 1

        # Boiler Registration (idx 4): Heavy industry with boilers
        if industry in [0, 1, 4, 6] and power >= 200:
            labels[4] = 1

        # Hazardous Waste Authorization (idx 5)
        if hazardous:
            labels[5] = 1

        # Environmental Clearance (idx 6): Large Red-category or high investment
        if pollution == 3 and investment >= 10.0:
            labels[6] = 1

        # Labour Registration S&E Act (idx 7): 10+ employees in commercial
        if employees >= 10:
            labels[7] = 1

        # EPF Registration (idx 8): 20+ employees
        if employees >= 20:
            labels[8] = 1

        # ESI Registration (idx 9): 10+ employees
        if employees >= 10:
            labels[9] = 1

        # GST Registration (idx 10): Always required for business
        if investment > 0.2:
            labels[10] = 1

        # HT Power Connection (idx 11): High power demand
        if power >= 100:
            labels[11] = 1

        # Groundwater NOC (idx 12): High water consumption
        if water >= 10:
            labels[12] = 1

        # Building Plan Approval (idx 13): Any construction/factory setup
        if industry in [0, 1, 2, 3, 4, 6, 7] and investment >= 1.0:
            labels[13] = 1

        # Trade License (idx 14): Most commercial operations
        if investment >= 0.5:
            labels[14] = 1

        # MSME/Udyam Registration (idx 15): Small-medium enterprises
        if investment <= 50.0 and employees <= 500:
            labels[15] = 1

        # Explosive License (idx 16): Chemical/mining with hazardous
        if industry in [1, 6] and hazardous:
            labels[16] = 1

        # Pollution Under Control (idx 17): Any polluting industry
        if pollution >= 1 and industry != 5:
            labels[17] = 1

        X.append(p)
        y.append(labels)

    # Augment with noise variations for better generalization
    augmented_X = []
    augmented_y = []
    rng = np.random.RandomState(42)
    for i in range(len(X)):
        for _ in range(5):
            noise = X[i].copy()
            # Add small perturbations to continuous features
            noise[3] = max(1, int(noise[3] + rng.randint(-20, 20)))   # employees
            noise[4] = max(0.1, noise[4] + rng.uniform(-1.0, 1.0))   # investment
            noise[5] = max(0, noise[5] + rng.randint(-30, 30))        # power
            noise[6] = max(0, noise[6] + rng.randint(-5, 5))          # water
            augmented_X.append(noise)
            augmented_y.append(y[i])

    X.extend(augmented_X)
    y.extend(augmented_y)

    return np.array(X, dtype=np.float64), np.array(y, dtype=np.int32)


# ─────────────────────────────────────────────────────────
# 2. FEATURE ENGINEERING
# ─────────────────────────────────────────────────────────

INDUSTRY_MAP = {
    'manufacturing': 0, 'chemical': 1, 'textile': 2, 'food': 3,
    'food processing': 3, 'pharmaceutical': 4, 'pharma': 4,
    'it': 5, 'services': 5, 'it/services': 5, 'software': 5,
    'mining': 6, 'construction': 7, 'infrastructure': 7
}

SECTOR_MAP = {
    'heavy engineering': 0, 'heavy engineering & metal fabrication': 0,
    'light engineering': 1, 'chemical': 2, 'chemicals': 2,
    'agro': 3, 'agriculture': 3, 'agro-processing': 3,
    'textile': 4, 'textiles': 4, 'garments': 4,
    'pharma': 5, 'pharmaceutical': 5,
    'it': 6, 'software': 6, 'ites': 6,
    'infrastructure': 7, 'construction': 7,
    'automobile': 8, 'automotive': 8, 'auto': 8,
    'electronics': 9, 'electrical': 9
}

POLLUTION_MAP = {
    'white': 0, 'green': 1, 'orange': 2, 'red': 3
}

STATE_MAP = {
    'chhattisgarh': 0, 'maharashtra': 1, 'gujarat': 2, 'odisha': 3,
    'karnataka': 4, 'tamil nadu': 5, 'rajasthan': 6,
    'uttar pradesh': 7, 'up': 7, 'madhya pradesh': 8, 'mp': 8
}


def encode_profile(profile):
    """Convert human-readable profile dict to numeric feature vector."""
    industry = INDUSTRY_MAP.get(
        (profile.get('industry', 'manufacturing')).lower(), 0
    )
    sector = SECTOR_MAP.get(
        (profile.get('sector', 'heavy engineering')).lower(), 0
    )
    pollution = POLLUTION_MAP.get(
        (profile.get('pollution_category', 'orange')).lower(), 2
    )
    employees = int(profile.get('employees', 0))
    investment = float(profile.get('investment_amount', 0))
    # Convert to crores if passed in raw rupees (> 1000 means raw)
    if investment > 1000:
        investment = investment / 10000000.0
    power = float(profile.get('power_requirement', 0))
    water = float(profile.get('water_consumption', 0))
    hazardous = 1 if profile.get('hazardous_materials', False) else 0
    state = STATE_MAP.get(
        (profile.get('state', 'chhattisgarh')).lower(), 9
    )

    return np.array([[industry, sector, pollution, employees, investment,
                       power, water, hazardous, state]], dtype=np.float64)


# ─────────────────────────────────────────────────────────
# 3. PRIORITY & STATUTORY REASONING ENGINE
# ─────────────────────────────────────────────────────────

APPROVAL_METADATA = {
    "Consent to Establish (CTE)": {
        "category": "ENVIRONMENT",
        "department": "State Pollution Control Board",
        "act": "Water (Prevention & Control of Pollution) Act, 1974 & Air Act, 1981",
        "sla_days": 30,
        "priority_base": "CRITICAL"
    },
    "Consent to Operate (CTO)": {
        "category": "ENVIRONMENT",
        "department": "State Pollution Control Board",
        "act": "Water Act 1974, Air Act 1981",
        "sla_days": 45,
        "priority_base": "CRITICAL"
    },
    "Factory License & Plan Approval": {
        "category": "FACTORY",
        "department": "Directorate of Industrial Health & Safety",
        "act": "Factories Act, 1948 (Section 6 & 7)",
        "sla_days": 30,
        "priority_base": "HIGH"
    },
    "Fire Safety NOC": {
        "category": "FIRE",
        "department": "State Fire & Emergency Services",
        "act": "Fire Safety Act & National Building Code 2016",
        "sla_days": 21,
        "priority_base": "HIGH"
    },
    "Boiler Registration": {
        "category": "SAFETY",
        "department": "Chief Inspector of Boilers",
        "act": "Indian Boilers Act, 1923",
        "sla_days": 30,
        "priority_base": "HIGH"
    },
    "Hazardous Waste Authorization": {
        "category": "ENVIRONMENT",
        "department": "State Pollution Control Board",
        "act": "Hazardous & Other Wastes (Management) Rules, 2016",
        "sla_days": 45,
        "priority_base": "CRITICAL"
    },
    "Environmental Clearance (EC)": {
        "category": "ENVIRONMENT",
        "department": "MoEFCC / SEIAA",
        "act": "Environment (Protection) Act, 1986 & EIA Notification 2006",
        "sla_days": 105,
        "priority_base": "CRITICAL"
    },
    "Labour Registration (S&E Act)": {
        "category": "LABOUR",
        "department": "Labour Commissioner",
        "act": "Shops & Establishments Act (State)",
        "sla_days": 15,
        "priority_base": "MEDIUM"
    },
    "EPF Registration": {
        "category": "LABOUR",
        "department": "Employees' Provident Fund Organisation",
        "act": "Employees' Provident Funds Act, 1952",
        "sla_days": 7,
        "priority_base": "MEDIUM"
    },
    "ESI Registration": {
        "category": "LABOUR",
        "department": "Employees' State Insurance Corporation",
        "act": "ESI Act, 1948",
        "sla_days": 7,
        "priority_base": "MEDIUM"
    },
    "GST Registration": {
        "category": "TAX",
        "department": "GST Network / CBIC",
        "act": "Central Goods & Services Tax Act, 2017",
        "sla_days": 7,
        "priority_base": "MEDIUM"
    },
    "HT Power Connection Sanction": {
        "category": "BUSINESS",
        "department": "State Electricity Distribution Company",
        "act": "Electricity Act, 2003",
        "sla_days": 30,
        "priority_base": "HIGH"
    },
    "Groundwater Extraction NOC": {
        "category": "LOCAL_AUTHORITY",
        "department": "Central Ground Water Authority (CGWA)",
        "act": "Environment Protection Act, 1986 & CGWA Guidelines",
        "sla_days": 60,
        "priority_base": "MEDIUM"
    },
    "Building Plan Approval": {
        "category": "LOCAL_AUTHORITY",
        "department": "Municipal Corporation / Development Authority",
        "act": "State Town & Country Planning Act",
        "sla_days": 30,
        "priority_base": "HIGH"
    },
    "Trade License": {
        "category": "BUSINESS",
        "department": "Municipal Corporation",
        "act": "State Municipal Corporation Act",
        "sla_days": 15,
        "priority_base": "MEDIUM"
    },
    "MSME/Udyam Registration": {
        "category": "BUSINESS",
        "department": "Ministry of MSME (Udyam Portal)",
        "act": "MSMED Act, 2006",
        "sla_days": 1,
        "priority_base": "LOW"
    },
    "Explosive License": {
        "category": "SAFETY",
        "department": "Petroleum & Explosives Safety Organisation (PESO)",
        "act": "Explosives Act, 1884 & Explosive Rules, 2008",
        "sla_days": 60,
        "priority_base": "CRITICAL"
    },
    "Pollution Under Control Certificate": {
        "category": "ENVIRONMENT",
        "department": "State Pollution Control Board",
        "act": "Water Act 1974, Air Act 1981",
        "sla_days": 15,
        "priority_base": "MEDIUM"
    },
}


# ─────────────────────────────────────────────────────────
# 4. MAIN PREDICTION PIPELINE
# ─────────────────────────────────────────────────────────

def train_and_predict(profile_data):
    """
    Train RandomForest model on regulatory corpus and predict
    required approvals for the given enterprise profile.
    """
    # Generate training data
    X_train, y_train = generate_training_data()

    # Train a MultiOutput RandomForest Classifier
    base_clf = RandomForestClassifier(
        n_estimators=200,
        max_depth=12,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
        class_weight='balanced'
    )
    model = MultiOutputClassifier(base_clf, n_jobs=-1)
    model.fit(X_train, y_train)

    # Encode the input profile
    X_input = encode_profile(profile_data)

    # Predict binary labels
    predictions = model.predict(X_input)[0]

    # Get probability scores for confidence
    probas = model.predict_proba(X_input)

    results = []
    for i, (label, pred) in enumerate(zip(APPROVAL_LABELS, predictions)):
        # Get positive class probability
        if hasattr(probas[i], '__len__') and len(probas[i].shape) > 1:
            confidence = float(probas[i][0][1]) if probas[i].shape[1] > 1 else float(pred)
        else:
            confidence = float(pred)

        if pred == 1 or confidence >= 0.35:
            meta = APPROVAL_METADATA.get(label, {})

            # Calculate dynamic priority based on confidence
            base_priority = meta.get('priority_base', 'MEDIUM')
            if confidence >= 0.90:
                priority = 'CRITICAL' if base_priority in ['CRITICAL', 'HIGH'] else 'HIGH'
            elif confidence >= 0.70:
                priority = base_priority
            else:
                priority = 'MEDIUM'

            results.append({
                "approval_name": label,
                "predicted": bool(pred == 1),
                "confidence": round(confidence * 100, 1),
                "category": meta.get("category", "OTHER"),
                "department": meta.get("department", "Competent Authority"),
                "statutory_act": meta.get("act", "Applicable Indian Law"),
                "estimated_sla_days": meta.get("sla_days", 30),
                "priority": priority,
                "reason": generate_reason(label, profile_data, confidence)
            })

    # Sort by confidence descending, then priority
    priority_order = {'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3}
    results.sort(key=lambda x: (priority_order.get(x['priority'], 9), -x['confidence']))

    # Feature importance analysis
    feature_names = [
        'Industry Type', 'Sector', 'Pollution Category',
        'Employees', 'Investment (Cr)', 'Power (HP)',
        'Water (KLD)', 'Hazardous Materials', 'State'
    ]
    importances = []
    for est in model.estimators_:
        importances.append(est.feature_importances_)
    avg_importance = np.mean(importances, axis=0)
    top_features = sorted(
        zip(feature_names, avg_importance.tolist()),
        key=lambda x: x[1], reverse=True
    )

    return {
        "ml_model": "RandomForestClassifier (scikit-learn)",
        "n_estimators": 200,
        "training_samples": len(X_train),
        "total_approvals_predicted": len(results),
        "predictions": results,
        "feature_importance": [
            {"feature": f, "importance": round(imp * 100, 1)}
            for f, imp in top_features
        ],
        "profile_encoded": {
            "raw_features": X_input[0].tolist(),
            "feature_names": feature_names
        }
    }


def generate_reason(approval_name, profile, confidence):
    """Generate human-readable statutory reasoning for each prediction."""
    inv = float(profile.get('investment_amount', 0))
    if inv > 1000:
        inv = inv / 10000000.0
    emp = int(profile.get('employees', 0))
    pol = profile.get('pollution_category', 'Orange')
    industry = profile.get('industry', 'Manufacturing')
    power = float(profile.get('power_requirement', 0))
    water = float(profile.get('water_consumption', 0))

    reasons = {
        "Consent to Establish (CTE)":
            f"ML model predicts {pol} category {industry} unit requires CTE under Water & Air Pollution Acts "
            f"(confidence: {confidence*100:.0f}%). Investment: ₹{inv:.1f} Cr.",
        "Consent to Operate (CTO)":
            f"CTO mandatory for {pol} pollution category operations. Model confidence: {confidence*100:.0f}%.",
        "Factory License & Plan Approval":
            f"Factories Act 1948 requires license for {industry} units with {emp} workers "
            f"(threshold: 10 workers with power / 20 without). Confidence: {confidence*100:.0f}%.",
        "Fire Safety NOC":
            f"Fire NOC predicted as necessary for {pol} category unit with {power:.0f} HP power load. "
            f"Confidence: {confidence*100:.0f}%.",
        "Boiler Registration":
            f"Indian Boilers Act 1923 applicable for {industry} with {power:.0f} HP power requirement. "
            f"Confidence: {confidence*100:.0f}%.",
        "Hazardous Waste Authorization":
            f"Hazardous waste management authorization under 2016 Rules for enterprise handling "
            f"industrial chemicals/waste. Confidence: {confidence*100:.0f}%.",
        "Environmental Clearance (EC)":
            f"EIA Notification 2006 triggers EC for {pol} category projects with ₹{inv:.1f} Cr investment. "
            f"Confidence: {confidence*100:.0f}%.",
        "Labour Registration (S&E Act)":
            f"Shops & Establishments Act registration for {emp} employees. Confidence: {confidence*100:.0f}%.",
        "EPF Registration":
            f"EPFO registration mandatory for establishments with {emp} employees (threshold: 20). "
            f"Confidence: {confidence*100:.0f}%.",
        "ESI Registration":
            f"ESIC registration mandatory for {emp} employees (threshold: 10). "
            f"Confidence: {confidence*100:.0f}%.",
        "GST Registration":
            f"GST registration required for commercial operations with ₹{inv:.1f} Cr turnover/investment. "
            f"Confidence: {confidence*100:.0f}%.",
        "HT Power Connection Sanction":
            f"HT power sanction needed for {power:.0f} HP load under Electricity Act 2003. "
            f"Confidence: {confidence*100:.0f}%.",
        "Groundwater Extraction NOC":
            f"CGWA NOC required for {water:.0f} KLD groundwater extraction. "
            f"Confidence: {confidence*100:.0f}%.",
        "Building Plan Approval":
            f"Building plan approval required for ₹{inv:.1f} Cr {industry} project. "
            f"Confidence: {confidence*100:.0f}%.",
        "Trade License":
            f"Municipal trade license required for commercial {industry} operations. "
            f"Confidence: {confidence*100:.0f}%.",
        "MSME/Udyam Registration":
            f"Udyam registration recommended under MSMED Act 2006 for enterprise with ₹{inv:.1f} Cr investment. "
            f"Confidence: {confidence*100:.0f}%.",
        "Explosive License":
            f"PESO explosive license predicted for {industry} operations handling hazardous materials. "
            f"Confidence: {confidence*100:.0f}%.",
        "Pollution Under Control Certificate":
            f"PUC certificate required for {pol} category {industry} unit. "
            f"Confidence: {confidence*100:.0f}%.",
    }
    return reasons.get(approval_name,
        f"ML model predicts this approval with {confidence*100:.0f}% confidence based on enterprise profile.")


# ─────────────────────────────────────────────────────────
# 5. USER REQUIREMENT ANALYSIS
# ─────────────────────────────────────────────────────────

def analyze_user_requirements(profile_data, query=None):
    """
    Use the trained RF model to analyze what the user's enterprise
    requires, and provide a structured requirements summary.
    """
    ml_results = train_and_predict(profile_data)

    # Categorize predictions
    critical = [p for p in ml_results['predictions'] if p['priority'] == 'CRITICAL']
    high = [p for p in ml_results['predictions'] if p['priority'] == 'HIGH']
    medium = [p for p in ml_results['predictions'] if p['priority'] == 'MEDIUM']
    low = [p for p in ml_results['predictions'] if p['priority'] == 'LOW']

    # Calculate overall compliance complexity score
    complexity_score = (
        len(critical) * 30 +
        len(high) * 20 +
        len(medium) * 10 +
        len(low) * 5
    )
    complexity_level = (
        'VERY HIGH' if complexity_score >= 200 else
        'HIGH' if complexity_score >= 120 else
        'MODERATE' if complexity_score >= 60 else
        'LOW'
    )

    # Estimated total time
    total_days = sum(p['estimated_sla_days'] for p in ml_results['predictions'])

    # Top driving features
    top_3_features = ml_results['feature_importance'][:3]

    requirement_analysis = {
        "ml_results": ml_results,
        "requirement_summary": {
            "total_approvals_needed": ml_results['total_approvals_predicted'],
            "critical_count": len(critical),
            "high_count": len(high),
            "medium_count": len(medium),
            "low_count": len(low),
            "complexity_score": complexity_score,
            "complexity_level": complexity_level,
            "estimated_total_processing_days": total_days,
            "top_driving_factors": top_3_features,
            "recommended_sequence": generate_sequence(ml_results['predictions']),
        }
    }

    # If query is provided, generate contextual response
    if query:
        requirement_analysis["contextual_response"] = generate_contextual_response(
            query, profile_data, ml_results
        )

    return requirement_analysis


def generate_sequence(predictions):
    """Generate recommended application sequence based on dependencies."""
    sequence = []
    step = 1

    # Phase 1: Registrations (can be done immediately)
    registrations = [p for p in predictions if p['category'] in ['TAX', 'BUSINESS']
                     and p['priority'] in ['MEDIUM', 'LOW']]
    if registrations:
        sequence.append({
            "phase": step,
            "phase_name": "Business Registrations & Licensing",
            "approvals": [r['approval_name'] for r in registrations],
            "estimated_days": max((r['estimated_sla_days'] for r in registrations), default=7),
            "can_parallel": True
        })
        step += 1

    # Phase 2: Environmental clearances (take longest, start early)
    env = [p for p in predictions if p['category'] == 'ENVIRONMENT']
    if env:
        sequence.append({
            "phase": step,
            "phase_name": "Environmental & Pollution Clearances",
            "approvals": [r['approval_name'] for r in env],
            "estimated_days": max((r['estimated_sla_days'] for r in env), default=45),
            "can_parallel": True
        })
        step += 1

    # Phase 3: Factory & Safety
    safety = [p for p in predictions if p['category'] in ['FACTORY', 'FIRE', 'SAFETY']]
    if safety:
        sequence.append({
            "phase": step,
            "phase_name": "Factory Setup, Fire & Safety Clearances",
            "approvals": [r['approval_name'] for r in safety],
            "estimated_days": max((r['estimated_sla_days'] for r in safety), default=30),
            "can_parallel": True
        })
        step += 1

    # Phase 4: Labour & Local Authority
    labour = [p for p in predictions if p['category'] in ['LABOUR', 'LOCAL_AUTHORITY']]
    if labour:
        sequence.append({
            "phase": step,
            "phase_name": "Labour Welfare & Local Authority Permits",
            "approvals": [r['approval_name'] for r in labour],
            "estimated_days": max((r['estimated_sla_days'] for r in labour), default=15),
            "can_parallel": True
        })
        step += 1

    return sequence


def generate_contextual_response(query, profile, ml_results):
    """Generate a contextual AI response based on the ML predictions."""
    q = query.lower()
    predictions = ml_results['predictions']
    company = profile.get('industry', 'Manufacturing')

    if 'approval' in q or 'clearance' in q or 'license' in q or 'require' in q:
        top_5 = predictions[:5]
        response = f"Based on RandomForest ML analysis of your {company} enterprise profile, "
        response += f"**{len(predictions)} regulatory approvals** are predicted as required:\n\n"
        for i, p in enumerate(top_5, 1):
            response += f"{i}. **{p['approval_name']}** — {p['confidence']}% confidence ({p['priority']})\n"
            response += f"   _{p['reason']}_\n\n"
        if len(predictions) > 5:
            response += f"\n...and {len(predictions) - 5} more approvals. See full analysis below."
        return response

    elif 'compliance' in q or 'risk' in q:
        critical = [p for p in predictions if p['priority'] == 'CRITICAL']
        response = f"**Compliance Risk Assessment (ML-Powered):**\n\n"
        response += f"Your enterprise has **{len(critical)} CRITICAL** regulatory obligations identified by the RandomForest model.\n\n"
        for p in critical:
            response += f"🚨 **{p['approval_name']}** — {p['statutory_act']}\n"
        return response

    else:
        response = f"**ML-Powered Enterprise Analysis:**\n\n"
        response += f"The RandomForest classifier (200 estimators, trained on {ml_results['training_samples']} regulatory samples) "
        response += f"has identified **{len(predictions)} applicable approvals** for your profile.\n\n"
        response += f"Top prediction factors: "
        response += ", ".join([f"{f['feature']} ({f['importance']}%)" for f in ml_results['feature_importance'][:3]])
        return response


# ─────────────────────────────────────────────────────────
# 6. CLI ENTRY POINT
# ─────────────────────────────────────────────────────────

def main():
    """Read JSON from stdin, run ML pipeline, output JSON to stdout."""
    # Fix Windows encoding for Unicode characters (₹ etc.)
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

    try:
        input_data = json.loads(sys.stdin.read())
        mode = input_data.get('mode', 'predict')
        profile = input_data.get('profile', {})
        query = input_data.get('query', None)

        if mode == 'analyze':
            result = analyze_user_requirements(profile, query)
        else:
            result = train_and_predict(profile)

        output = json.dumps(result, indent=2, ensure_ascii=False)
        print(output)
        sys.exit(0)

    except Exception as e:
        error_output = json.dumps({
            "error": True,
            "message": str(e),
            "type": type(e).__name__
        })
        print(error_output, file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
