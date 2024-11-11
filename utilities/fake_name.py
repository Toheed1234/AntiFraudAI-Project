import re
from fastapi import FastAPI
from pydantic import BaseModel, EmailStr
import dns.resolver
from faker import Faker

app = FastAPI()

def extract_domain(email):
    parts = email.split('@')
    if len(parts) == 2:
        return parts[1]
    else:
        return None

def get_mx_records(domain):
    try:
        mx_records = dns.resolver.resolve(domain, 'MX')
        return [str(record.exchange)[:-1] for record in mx_records]
    except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer, dns.resolver.Timeout):
        return None

def is_likely_fake(name, email, enable_additional_checks=True):
    if len(name) < 3 or re.search(r"[^a-zA-Z\-'\s]", name):
        return True
    if re.search(r"(first|last|name)", name, re.IGNORECASE):
        return True

    if enable_additional_checks:
        fake = Faker()
        if name in fake.unique.name():
            return True

    domain = extract_domain(email)
    if not re.match(r"[^@]+@[^@]+\.[a-zA-Z]{2,}", email):
        return True
    mx_records = get_mx_records(domain)
    if not mx_records:
        return True

    if enable_additional_checks:
        domain = email.split("@")[-1].lower()
        disposable_providers = [
            "a45.in", "cachedot.net", "manifestgenerator.com", "mvrht.com",
            "nonspam.eu", "nonspammer.de", "spamstack.net", "anon.leemail.me",
            "anonymize.com", "1usemail.com", "fakeinbox.info", "mymintinbox.com",
            "mailna.in", "fakemail.intimsex.de", "govnomail.xyz", "anonmail.top",
            "solowtech.com", "mailox.biz", "1337.no", "opayq.com", "nowbuzzoff.com",
            "beconfidential.com", "dontrackme.com", "beconfidential.net",
            "moremobileprivacy.com", "blurme.net", "ipriva.net", "zzrgg.com",
            "celinecityitalia.com", "digital10network.com", "ivyandmarj.com",
            "freetemporaryemail.com", "masudcl.com"
        ]
        if domain in disposable_providers:
            return True

        if "." in name and name.split(".")[0].lower() not in email.split("@")[-1]:
            return False

    return False

class CheckRequest(BaseModel):
    name: str
    email: EmailStr
    enable_additional_checks: bool = True

@app.post("/check")
def check_fake(request: CheckRequest):
    result = is_likely_fake(request.name, request.email, request.enable_additional_checks)
    return {"is_fake": result}
