import pytest
import requests


BASE_URL  = "http://localhost:8000"


token = ""

def test_authenticate_user():
    response = requests.post(f"{BASE_URL}/login", json={"username": "user", "password": "password"})
    assert response.status_code == 200

def test_register():
    response = requests.post(f"{BASE_URL}/register", json={"username": "user", "password": "password", "email": "jari@gmail.com", "name": "Jari", "balance": 1000})
    assert response.status_code == 200

def test_reset_password():
    response = requests.post(f"{BASE_URL}/reset_password", json={"username": "user", "password": "password"})
    assert response.status_code == 200

def test_login_for_access_token():
    response = requests.post(f"{BASE_URL}/token", data={"username": "user", "password": "password"})
    assert response.status_code == 200