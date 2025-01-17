from requests import Session
from urllib.parse import urljoin
import os
from dotenv import load_dotenv

load_dotenv()
refreshToken = os.getenv("REFRESH_TOKEN")
accessToken = None

class LiveServerSession(Session):
    def __init__(self, base_url=None):
        super().__init__()
        self.base_url = base_url

        if os.getenv("REFRESH_TOKEN") == None and os.getenv("SIGNIN_INSTEAD") == None or os.getenv("SIGNIN_INSTEAD") == "true" and (os.getenv("EMAIL") == None or os.getenv("PASSWORD") == None):
            return

        if os.getenv("SIGNIN_INSTEAD") == "true":
            self.signin()
        else:
            self.refresh_token()

    def refresh_token(self):
        global accessToken
        url = urljoin(self.base_url, 'auth/refresh')

        body = {
            'refreshToken': refreshToken
        }

        response = self.post(url, json=body)

        if response.status_code == 200:
            accessToken = response.json()['response']['accessToken']
        else:
            raise Exception('Failed to refresh token')

    def signin(self):
        global accessToken
        url = urljoin(self.base_url, 'auth/login')

        body = {
            'email': os.getenv('EMAIL'),
            'password': os.getenv('PASSWORD')
        }

        response = self.post(url, json=body)

        if response.status_code == 200:
            accessToken = response.json()['response']['accessToken']
        else:
            raise Exception('Failed to sign in')

    def request(self, method, url, *args, **kwargs):
        joined_url = urljoin(self.base_url, url)

        # Ensure headers exist in kwargs
        headers = kwargs.pop('headers', {})

        # Add Authorization header
        if accessToken:
            headers['Authorization'] = accessToken

        # Update kwargs headers
        kwargs['headers'] = headers

        return super().request(method, joined_url, *args, **kwargs)
