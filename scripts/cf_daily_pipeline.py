import os
import requests
from datetime import datetime
from pydrive2.auth import GoogleAuth
from pydrive2.drive import GoogleDrive
import json

# --- Date Setup ---
today = datetime.today()
url_date = today.strftime("%Y/%m/%d")
file_stamp = today.strftime("%Y-%m-%d")
raw_path = f"/tmp/cf_raw_{file_stamp}.csv"

# --- Download CSV ---
url = f"https://www.contractsfinder.service.gov.uk/Harvester/Notices/Data/CSV/{url_date}"
response = requests.get(url)
response.raise_for_status()
with open(raw_path, "wb") as f:
    f.write(response.content)
print(f"✅ Downloaded raw CSV to: {raw_path}")

# --- Google Drive Upload ---
creds_json = os.environ['GDRIVE_CREDENTIALS_JSON']
with open('/tmp/creds.json', 'w') as f:
    f.write(creds_json)

gauth = GoogleAuth()
gauth.LoadServiceConfigFile('/tmp/creds.json')
gauth.ServiceAuth()
drive = GoogleDrive(gauth)

upload_file = drive.CreateFile({
    "title": f"cf_raw_{file_stamp}.csv",
    "parents": [{"id": "1TTXl47cS3TAktsu3Vby-4gTkbrJ_-1hQ"}]  # Your public folder ID
})
upload_file.SetContentFile(raw_path)
upload_file.Upload()
print("✅ Raw CSV uploaded to Google Drive")
