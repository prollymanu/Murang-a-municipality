# seed_users.py

import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Muranga_transport.settings')
django.setup()

from core.models import User

# -------------------------------
# CONFIG: Your test users here
# -------------------------------
users_data = [
    {
        "username": "otieno",
        "email": "otieno@gmail.com",
        "phone_number": "0787907654",
        "role": "driver",
        "dl_no": "DL12345",
        "id_no": "12345678",
        "location": "Murang'a Town",
        "password": "Password123@",
    },
    {
        "username": "cate",
        "email": "cate@gmail.com",
        "phone_number": "0734562897",
        "role": "mechanic",
        "dl_no": "DL54321",
        "id_no": "87654321",
        "location": "Murang'a Garage",
        "password": "Password123@",
    },
    {
        "username": "manager3",
        "email": "manager3@gmail.com",
        "phone_number": "0778923467",
        "role": "transport_manager",
        "dl_no": "DL99999",
        "id_no": "11223344",
        "location": "Murang'a HQ",
        "password": "Password123@",
    },
    {
        "username": "chief1",
        "email": "chief2@gmail.com",
        "phone_number": "0787452738",
        "role": "chief_officer",
        "dl_no": "DL88888",
        "id_no": "44332211",
        "location": "Murang'a County Offices",
        "password": "Password123@",
    },
]

# -------------------------------
# Insert or update users
# -------------------------------

for data in users_data:
    user, created = User.objects.get_or_create(
        username=data['username'],
        defaults={
            "email": data["email"],
            "phone_number": data["phone_number"],
            "role": data["role"],
            "dl_no": data["dl_no"],
            "id_no": data["id_no"],
            "location": data["location"],
            "is_active": True,  # Activate by default
        },
    )
    user.set_password(data["password"])
    user.save()
    if created:
        print(f"Created: {user.username}")
    else:
        print(f"Updated: {user.username}")

print("\n✅ All done! Users seeded.")
