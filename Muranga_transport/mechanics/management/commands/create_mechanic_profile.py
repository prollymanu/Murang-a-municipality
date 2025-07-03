from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from mechanics.models import MechanicProfile

class Command(BaseCommand):
    help = 'Creates a MechanicProfile for a specified user by email or phone number.'

    def add_arguments(self, parser):
        parser.add_argument('identifier', type=str, help='Email or phone number of the user')

    def handle(self, *args, **options):
        identifier = options['identifier']
        User = get_user_model()

        try:
            # Lookup the mechanic user
            user = User.objects.get(email=identifier)  # Adjust to phone_number if needed

            # Create MechanicProfile attached to that user
            profile, created = MechanicProfile.objects.get_or_create(
                user=user,
                defaults={
                    'experience_years': 5,  # Set initial experience
                    'location': "Murang'a Garage",  # Set location
                }
            )

            if created:
                self.stdout.write(
                    self.style.SUCCESS(f"Mechanic profile created successfully for {user.get_full_name() or user.username}.")
                )
            else:
                self.stdout.write(
                    self.style.WARNING("Mechanic profile already existed for this user.")
                )

        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR("No user found with that identifier. Check email/phone spelling.")
            )