# Generated by Django 5.2.3 on 2025-07-08 01:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0004_registrationrequest'),
    ]

    operations = [
        migrations.AddField(
            model_name='registrationrequest',
            name='department',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='registrationrequest',
            name='experience_years',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='registrationrequest',
            name='license_class',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='registrationrequest',
            name='specialization',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='registrationrequest',
            name='supervisor',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
