Vehicle Repair Management System
Overview
The Vehicle Repair Management System is a Django-based web application designed to manage drivers, mechanics and  repair-related tasks, including job management, maintenance requests, personnel management, repair invoices, and support requests. It provides a user-friendly interface for managers to oversee operations, assign mechanics, generate reports, and handle vehicle maintenance efficiently.
This project is built with a focus on modularity and scalability, utilizing Django's ORM for database interactions and a command-line SQL database (e.g., MySQL or PostgreSQL) for data storage.
Features

Dashboard for an overview of operations
Job Management with a dropdown for Mechanic Tasks
Maintenance request tracking and mechanic assignment
Personnel and application management
Report generation and export
Repair invoice approval and export
Support request handling

Requirements
To set up and run this project locally, ensure the following requirements are met:
System Requirements

Operating System: Linux, macOS, or Windows
Python: Version 3.9 or higher
Database: MySQL or PostgreSQL (managed via SQL Command Line)
Web Browser: Modern browser (e.g., Chrome, Firefox, Edge)

Software Dependencies

Django: 4.2 or higher
django-crispy-forms: For form rendering (optional, if used)
django-filter: For filtering querysets (optional, if used)
Pillow: For image handling (if profile images are used)
psycopg2 or mysqlclient: Database adapter for PostgreSQL or MySQL, respectively
Font Awesome: 6.4.0 or higher (via CDN)

Python Packages
Install the required Python packages using pip:
pip install django==4.2.13
pip install django-crispy-forms  # If used
pip install django-filter  # If used
pip install pillow
pip install psycopg2-binary  # For PostgreSQL
pip install mysqlclient  # For MySQL

Database Setup

Database Server: Install and configure MySQL or PostgreSQL.
MySQL: sudo apt install mysql-server (Ubuntu) or equivalent.
PostgreSQL: sudo apt install postgresql postgresql-contrib (Ubuntu) or equivalent.


Create Database: Use SQL Command Line to create a database and user.
For MySQL:CREATE DATABASE transport_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'transport_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON transport_manager.* TO 'transport_user'@'localhost';
FLUSH PRIVILEGES;


For PostgreSQL:CREATE DATABASE transport_manager;
CREATE USER transport_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE transport_manager TO transport_user;




Configure Settings: Update settings.py with your database credentials:DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',  # or 'django.db.backends.postgresql'
        'NAME': 'transport_manager',
        'USER': 'transport_user',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '3306',  # or '5432' for PostgreSQL
    }
}



Additional Tools

Git: For version control (optional but recommended)
Virtual Environment: python -m venv env to isolate dependencies

Installation
1. Clone the Repository
git clone <repository-url>

2. Set Up Virtual Environment
python -m venv env
source env/bin/activate  # On Windows: env\Scripts\activate

3. Install Dependencies
pip install -r requirements.txt  # Create requirements.txt with `pip freeze > requirements.txt` after installing packages

4. Configure Environment

Copy settings.py.example to settings.py (if applicable) and update database settings.
Set DEBUG = True for development (change to False in production).

5. Apply Migrations
python manage.py makemigrations
python manage.py migrate

6. Create Superuser
python manage.py createsuperuser

7. Run the Development Server
python manage.py runserver

8. Access the Application
Open your browser and go to (http://127.0.0.1:8000/). Log in with the superuser credentials.
Usage

Navigate the sidebar to access different modules (e.g., Job Management, Maintenance).
Use the dropdown under Job Management to view Mechanic Tasks.
Assign mechanics to approved maintenance requests via the Maintenance section.

Development

Add New Features: Extend views, models, and templates as needed.
Testing: Use Django’s testing framework (python manage.py test).
Contributing: Fork the repository, create a branch, and submit a pull request.

License
[Specify your license, e.g., MIT, GPL, or proprietary] - Add details if applicable.
Contact
For support or issues, contact pemmanuel218@gmail.com.
