from django.db import migrations
import string, random

def generate_unique_ids(apps, schema_editor):
    MechanicTask = apps.get_model('mechanics', 'MechanicTask')
    for task in MechanicTask.objects.all():
        task.unique_task_id = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        task.save()

class Migration(migrations.Migration):

    dependencies = [
('mechanics', '0006_mechanictask_unique_task_id_repairinvoice_and_more'),
    ]

    operations = [
        migrations.RunPython(generate_unique_ids),
    ]
