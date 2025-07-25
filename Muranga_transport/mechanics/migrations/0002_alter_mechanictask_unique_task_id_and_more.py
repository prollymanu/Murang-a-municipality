# Generated by Django 5.2.3 on 2025-07-17 23:49

import mechanics.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mechanics', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='mechanictask',
            name='unique_task_id',
            field=models.CharField(default=mechanics.models.generate_unique_task_id, editable=False, max_length=8, unique=True),
        ),
        migrations.AlterField(
            model_name='repairinvoice',
            name='task_unique_id',
            field=models.CharField(default=mechanics.models.generate_invoice_id, editable=False, max_length=30, unique=True),
        ),
    ]
