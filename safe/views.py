from django.shortcuts import render,redirect
from django.http import HttpResponse
from django.contrib.auth.models import User
from django.contrib.auth import login
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.shortcuts import render
from django.http import JsonResponse
from django.shortcuts import render

# Create your views here.
# def index(request):
#     return render(request, "index.html")

def learn(request):
    return render(request, "learn.html")

def drills(request):
    return render(request, "drills.html")

def games(request):
    return render(request, "games.html")

def leaderboard(request):
    return render(request, "leaderboard.html")

def emergency(request):
    return render(request, "emergency.html")

def profile(request):
    return render(request, "profile.html")

def chat(request):
    import os
    # Get API keys from environment variable, split by comma
    api_keys_str = os.getenv('GEMINI_API_KEYS', '')
    api_keys = [key.strip() for key in api_keys_str.split(',') if key.strip()]
    
    # Pass keys to template as JSON string
    import json
    context = {
        'gemini_api_keys_json': json.dumps(api_keys)
    }
    return render(request, "chat.html", context)

def escape_room(request):
    return render(request, "games/escape_room.html")


def  Flood_Safety(request):
    return render(request, "games/Flood_SafetyG.html")

def  earth(request):
    return render(request, "games/earth.html")

def  fire_sefty_modules(request):
    return render(request, "learn/fire_sefty.html")

def  Earthquake_Safety(request):
    return render(request, "learn/Earthquake_Safety.html")


def  FireSafety(request):
    return render(request, "learn/Fire-Safety.html")

def  Cyclone_Safety(request):
    return render(request, "learn/Cyclone_Safety.html")



def  Firstaid (request):
    return render(request, "learn/Firstaid.html")

def Emergency_Communication(request):
    return render(request, "learn/emergency_com.html")

def WinterStorms_Safety(request):
    return render(request, "learn/winterstorm.html")

def HeatWave_Safety(request):
    return render (request, "learn/heatwave.html")

def Tornado_Safety(request):
    return render(request, "learn/tornado.html")

def landslide_Safety(request):
    return render(request, "learn/landslide_sefty.html")

def tsunami_safety(request):
    return render(request, "learn/tsunami_safety.html")


def signup_view(request):
    if request.method == "POST":
        username = request.POST.get('username', '').strip()
        email = request.POST.get('email', '').strip()
        password = request.POST.get('password')
        confirm_password = request.POST.get('confirm_password')

        def signup_fail(message):
            return render(request, 'login.html', {
                'signup_error': message,
                'is_signup': True,
                'signup_username': username,
                'signup_email': email,
            })

        if not username or not email or not password:
            return signup_fail('Please fill in all fields.')

        if password != confirm_password:
            return signup_fail('Passwords do not match.')

        if len(password) < 8:
            return signup_fail('Password must be at least 8 characters.')

        # 1. Manually check if username exists
        if User.objects.filter(username__iexact=username).exists():
            return signup_fail('Username already taken.')

        # 2. Block duplicate accounts on the same email so password reset
        #    (which looks users up by email) stays unambiguous.
        if User.objects.filter(email__iexact=email).exists():
            return signup_fail('An account with this email already exists. Try signing in or resetting your password instead.')

        try:
            # 3. Create user
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password
            )
            # 4. Login and redirect
            login(request, user)
            return redirect('index')
        except IntegrityError:
            return signup_fail('Database error. Try a different username.')

    # Agar GET request hai (pehli baar page khula), toh signup side dikhao
    return render(request, 'login.html', {'is_signup': False})




def login_view(request):
    if request.method == "POST":
        identifier = request.POST.get('username', '').strip()
        password = request.POST.get('password')

        # Allow signing in with either username or email. Emails aren't
        # guaranteed unique, so if more than one account shares it we can't
        # tell which one was meant - ask the user to use their username instead.
        username = identifier
        if '@' in identifier:
            matches = User.objects.filter(email__iexact=identifier)
            if matches.count() == 1:
                username = matches.first().username
            elif matches.count() > 1:
                return render(request, 'login.html', {
                    'error': 'Multiple accounts use this email. Please sign in with your username instead.',
                    'is_signup': False,
                })

        user = authenticate(
            request,
            username=username,
            password=password
        )

        if user:
            login(request, user)
            return redirect('index')
        else:
            return render(request, 'login.html', {'error': 'Invalid credentials', 'is_signup': False})

    return render(request, 'login.html')

@login_required(login_url='login')
def index(request):
    return render(request, 'index.html')


def logout_view(request):
    logout(request)
    return redirect('landing')


def weather(request):
    return render(request, "weather.html")

def full_map(request):
    return render(request, "map.html")

def drills_simulation(request):
    return render(request, 'drills_simulation.html')
def drill_simulation(request):
    # render the simulation template
    return render(request, 'drills_simulation.html')

def flood_simulation(request):
    return render(request, 'drills_simulation.html')

def wildfire_simulation(request):
    return render(request, 'wildfire_simulation.html')

def cyclone_simulation(request):
    return render(request, 'cyclone_simulation.html')

def landslide_simulation(request):
    return render(request, 'landslide_simulation.html')

def vr_videos(request):
    return render(request, 'vr.html')


def Flood_SafetyL(request):
    return render(request, "learn/flood.html")

def Fire_Safety(request):
    return render(request, "learn/fire.html")

# def Cyclone_Safety(request):
#     return render(request, "learn/cyclone.html")

def Tsunami_Safety(request):
    return render(request, "learn/tsunami.html")

def Tornado_Safety(request):
    return render(request, "learn/tornado.html")

def HeatWave_Safety(request):
    return render(request, "learn/heatwave.html")


def air_pollution_safety(request):
    return render(request, "learn/air_pollution.html")

def FirstAid_Safety(request):
    return render(request, "learn/firstaid.html")
def WinterStorms_Safety(request):
    return render(request, "learn/winterstorm.html")

def war_civil_defence(request):
    return render(request, "learn/war_civil_defence.html")

def Gas_Leak_Safety(request):
    return render(request, "learn/gas_leak.html")

def major_transport_accident(request):
    return render(request, "learn/major_transport_accident.html")


def thunderstorm(request):
    return render(request, "learn/thunderstorm.html")

def dam_reservoir_failure(request):
    return render(request, "learn/dam_reservoir_failure.html")

def learn_nuclear(request):
    return render(request, "learn/nuclear.html")


# def ar_hub(request):
#     return render(request, "ar/index.html")



def protect_index(request):
    """
    Role selection page: Protect Home, Farm & Livelihood
    """
    return render(request, "protect/index.html")

def protect_farmers(request):
    return render(request, "protect/farmers.html")

def protect_households(request):
    return render(request, "protect/households.html")

def protect_community(request):
    return render(request, "protect/community.html")

def protect_schools(request):
    return render(request, "protect/schools.html")

# safe/views.py  -- add these functions near protect_* views
def farmers_index(request):
    # keeps a friendly index (if you already have protect_farmers pointing to same template skip this)
    return render(request, "protect/farmers.html")

def farmers_flood(request):
    return render(request, "protect/farmers/flood.html")

def farmers_cyclone(request):
    return render(request, "protect/farmers/cyclone.html")

def farmers_heatwave(request):
    return render(request, "protect/farmers/heatwave.html")

def farmers_drought(request):
    return render(request, "protect/farmers/drought.html")


# Modules


def households_flood(request):
    return render(request, 'protect/households/flood.html')

def households_cyclone(request):
    return render(request, 'protect/households/cyclone.html')

def households_heatwave(request):
    return render(request, 'protect/households/heatwave.html')

def households_fire(request):
    return render(request, 'protect/households/fire.html')

def households_earthquake(request):
    return render(request, 'protect/households/earthquake.html')

# ============================
# COMMUNITY MODULES
# ============================


def community_shelters(request):
    return render(request, 'protect/community/shelters.html')


def community_evacuation(request):
    return render(request, 'protect/community/evacuation.html')


def community_grain_banks(request):
    return render(request, 'protect/community/grain_banks.html')


def community_rescue(request):
    return render(request, 'protect/community/rescue.html')


def community_wash(request):
    return render(request, 'protect/community/wash.html')


def community_drills(request):
    return render(request, 'protect/community/drills.html')

# Individual module pages Schools
def schools_audit(request):
    return render(request, 'protect/schools/audit.html')

def schools_evacuation(request):
    return render(request, 'protect/schools/evacuation.html')

def schools_supplies(request):
    return render(request, 'protect/schools/supplies.html')

def schools_child_protection(request):
    return render(request, 'protect/schools/child_protection.html')

def schools_convert_shelter(request):
    return render(request, 'protect/schools/convert_shelter.html')

def schools_drills(request):
    return render(request, 'protect/schools/drills.html')

def zones_api(request):
    """API endpoint for heatwave zones - Bhopal specific, non-overlapping"""
    data = [
        # Red zones - Extreme heat (800-1000m, near hospitals)
        {"lat": 23.1850, "lng": 77.4380, "radius": 900, "level": "high", "msg": "<strong style='color:#dc2626;'>AYODHYA NAGAR - EXTREME HEAT</strong><br>Temp: 44-46°C | Risk: CRITICAL"},
        {"lat": 23.2650, "lng": 77.4020, "radius": 1000, "level": "high", "msg": "<strong style='color:#dc2626;'>HABIBGANJ - EXTREME HEAT</strong><br>Temp: 43-45°C | Risk: CRITICAL"},
        
        # Yellow zones - High heat (800-900m, spread out)
        {"lat": 23.2420, "lng": 77.4050, "radius": 900, "level": "medium", "msg": "<strong style='color:#d97706;'>MP NAGAR ZONE 1 - HIGH HEAT</strong><br>Temp: 42-44°C | Risk: MODERATE"},
        {"lat": 23.2050, "lng": 77.4500, "radius": 900, "level": "medium", "msg": "<strong style='color:#d97706;'>KOLAR AREA - HIGH HEAT</strong><br>Temp: 41-43°C | Risk: MODERATE"},
        {"lat": 23.1700, "lng": 77.4100, "radius": 900, "level": "medium", "msg": "<strong style='color:#d97706;'>BAIRAGARH - HIGH HEAT</strong><br>Temp: 42-44°C | Risk: MODERATE"},
        
        # Green zones - Moderate (800-1000m, near hospitals/cooling centers)
        {"lat": 23.2520, "lng": 77.4050, "radius": 800, "level": "safe", "msg": "<strong style='color:#059669;'>NEW MARKET - MODERATE</strong><br>Temp: 39-41°C | Hospitals nearby"},
        {"lat": 23.2450, "lng": 77.3700, "radius": 1000, "level": "safe", "msg": "<strong style='color:#059669;'>UPPER LAKE AREA - MODERATE</strong><br>Temp: 38-40°C | Lake breeze"},
        {"lat": 23.2180, "lng": 77.4250, "radius": 850, "level": "safe", "msg": "<strong style='color:#059669;'>TT NAGAR - MODERATE</strong><br>Temp: 39-41°C | Cooling center nearby"},
        
        # Prestige Institute (small, no overlap)
        {"lat": 23.2156, "lng": 77.4305, "radius": 600, "level": "high", "msg": "<strong style='color:#dc2626;'>PRESTIGE INSTITUTE</strong><br>Current: 35-40°C | HEAT ALERT"},
    ]
    return JsonResponse(data, safe=False)

def landing(request):
    """Landing page view"""
    if request.user.is_authenticated:
        return redirect('index')
    return render(request, 'landing.html')