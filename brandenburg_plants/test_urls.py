import unittest
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from .models import SolarPlant

class SolarPlantViewSetTestCase(TestCase):
    """
    Test case for SolarPlantViewSet API endpoints.
    """

    def setUp(self):
        """
        Set up initial data and client for testing.
        """
        self.client = APIClient()
        self.url = reverse('solarplant-list')
        # Create a sample SolarPlant object for testing
        self.solar_plant_data = {
            'name': 'Test Solar Plant',
            'geometry': '{"type": "Point", "coordinates": [1.0, 2.0]}'
        }
        self.solar_plant = SolarPlant.objects.create(**self.solar_plant_data)

    def test_list_solar_plants(self):
        """
        Test listing all solar plants via GET request.
        """
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)


    def test_retrieve_solar_plant(self):
        """
        Test retrieving a specific solar plant via GET request.
        """
        url = reverse('solarplant-detail', args=[self.solar_plant.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], self.solar_plant_data['name'])


    def test_create_solar_plant(self):
        """
        Test creating a new solar plant via POST request.
        """
        new_solar_plant_data = {
            'name': 'New Test Solar Plant',
            'geometry': '{"type": "Point", "coordinates": [2.0, 3.0]}'
        }
        response = self.client.post(self.url, new_solar_plant_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(SolarPlant.objects.count(), 2)


    def test_update_solar_plant(self):
        """
        Test updating an existing solar plant via PUT request.
        """
        updated_data = {
            'name': 'Updated Test Solar Plant',
            'geometry': '{"type": "Point", "coordinates": [3.0, 4.0]}'
        }
        url = reverse('solarplant-detail', args=[self.solar_plant.id])
        response = self.client.put(url, updated_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.solar_plant.refresh_from_db()
        self.assertEqual(self.solar_plant.name, 'Updated Test Solar Plant')


    def test_partial_update_solar_plant(self):
        """
        Test partially updating an existing solar
        plant via PATCH request.
        """
        updated_data = {
            'geometry': '{"type": "Point", "coordinates": [3.0, 4.0]}'
        }
        url = reverse('solarplant-detail', args=[self.solar_plant.id])
        response = self.client.patch(url, updated_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.solar_plant.refresh_from_db()
        self.assertEqual(self.solar_plant.geometry, '{"type": "Point", "coordinates": [3.0, 4.0]}')


    def test_delete_solar_plant(self):
        """
        Test deleting an existing solar plant via DELETE request.
        """
        url = reverse('solarplant-detail', args=[self.solar_plant.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(SolarPlant.objects.filter(id=self.solar_plant.id).exists())


if __name__ == '__main__':
    unittest.main()