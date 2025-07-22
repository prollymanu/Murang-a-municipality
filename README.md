# 🚗 Vehicle Repair Management System
A This is a Django-based web application for managing vehicle maintenance and repair operations. Designed for chief officers, transport managers, drivers, and mechanics, it streamlines:

✅ Maintenance Requests
✅ Mechanic Assignment & Job Management
✅ Personnel & Application Management
✅ Repair Invoice Tracking & Approvals
✅ Detailed Reporting & Exporting

Built for modularity and scalability using Django ORM and MySQL/PostgreSQL.

📌 **Features**

* **Dashboard** with real-time stats
* **Maintenance Requests**: Submit, approve, assign, and track
* **Mechanic Job Management**
* **Personnel & Application Management**
* **Repair Invoice Management** with PDF & Excel export
* **Support Requests** for drivers & mechanics
* **Reports & Analytics** with charts (maintenance, invoices, vehicles, etc.)


 **System Requirements**

| Requirement        | Details                              |
| ------------------ | ------------------------------------ |
| **OS**             | Linux, macOS, or Windows             |
| **Python**         | 3.9 or higher                        |
| **Database**       | MySQL or PostgreSQL                  |
| **Browser**        | Chrome, Firefox, or Edge (latest)    |
| **Optional Tools** | Git, Virtual Environment recommended |

 **Tech Stack & Dependencies**

Main Python packages:

```
Django==4.2.13
mysqlclient==2.2.4        # MySQL support
psycopg2-binary           # PostgreSQL support (optional)
Pillow==10.3.0            # Image handling
django-crispy-forms==2.1  # Better form rendering
django-filter==23.5       # Query filtering
openpyxl==3.1.5           # Excel export
reportlab==4.2.0          # PDF generation
```

✅ See full [requirements.txt](requirements.txt).

Install with:

```bash
pip install -r requirements.txt
```
 **Database Setup**

 ✅ MySQL

```sql
CREATE DATABASE transport_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'transport_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON transport_manager.* TO 'transport_user'@'localhost';
FLUSH PRIVILEGES;
```

 ✅ PostgreSQL

```sql
CREATE DATABASE transport_manager;
CREATE USER transport_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE transport_manager TO transport_user;
```

Update **`settings.py`**:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',  # or 'django.db.backends.postgresql'
        'NAME': 'transport_manager',
        'USER': 'transport_user',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '3306',  # or 5432 for PostgreSQL
    }
}
```

**Installation & Setup**

```bash
# 1. Clone Repository
git clone https://github.com/prollymanu/Murang-a-municipality.git
cd Murang-a-municipality

# 2. Create & Activate Virtual Environment
python -m venv env
source env/bin/activate   # Windows: env\Scripts\activate

# 3. Install Dependencies
pip install -r requirements.txt

# 4. Apply Migrations
python manage.py makemigrations
python manage.py migrate

# 5. Create Users
python seed_user.py        # (optional: auto-creates test users)
python manage.py createsuperuser

# 6. Run Server
python manage.py runserver
```

Open your browser → [http://127.0.0.1:8000/](http://127.0.0.1:8000/)


**Usage**

* **Manager Dashboard**: View stats, approve maintenance requests, assign mechanics
* **Drivers**: Submit maintenance requests & track status
* **Mechanics**: Manage tasks, submit invoices, and request support
* **Reports**: Generate PDF/Excel reports for maintenance, invoices, mechanics, drivers, and vehicles

 **Development & Contribution**

* **Run Tests**:

```bash
python manage.py test
```

* **Add New Features**: Extend Django apps (`views.py`, `models.py`, `templates/`)
* **Contribute**: Fork → Create Branch → Push → Pull Request

---

## 📄 **License**

MIT License – Feel free to use & modify.


## 📬 **Contact**

👤 **Maintainer**: Prollymanu
📧 **Email**: [pemmanuel218@gmail.com](mailto:pemmanuel218@gmail.com)



