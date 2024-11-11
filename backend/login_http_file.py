import requests
import re
import sys

data = {"username": sys.argv[0], "password": sys.argv[1]}
headers = {"Content-Type": "application/x-www-form-urlencoded"}

requests.post("http://localhost:8000/auth/token", data, headers)