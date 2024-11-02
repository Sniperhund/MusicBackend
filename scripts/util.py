from requests import Session
from urllib.parse import urljoin
import os
from dotenv import load_dotenv

load_dotenv()
accessToken = os.getenv("TOKEN")


class LiveServerSession(Session):
    def __init__(self, base_url=None):
        super().__init__()
        self.base_url = base_url

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
