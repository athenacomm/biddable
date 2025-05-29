import os
import pandas as pd
import random
import string
from datetime import datetime
from pydrive2.auth import GoogleAuth
from pydrive2.drive import GoogleDrive
from supabase import create_client

# --- Supabase setup ---
SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_KEY"]
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- Google Drive setup ---
creds_json = os.environ['GDRIVE_CREDENTIALS_JSON']
creds_path = '/tmp/creds.json'
with open(creds_path, 'w') as f:
    f.write(creds_json)

gauth = GoogleAuth(settings_file=None)
gauth.LoadServiceConfigSettings({
    "client_config_backend": "service",
    "service_config": {
        "client_service_account": creds_path
    }
})
gauth.ServiceAuth()
drive = GoogleDrive(gauth)

# --- Find the most recent file ---
folder_id = "1TTXl47cS3TAktsu3Vby-4gTkbrJ_-1hQ"
file_list = drive.ListFile({'q': f"'{folder_id}' in parents and trashed=false"}).GetList()
csv_files = [f for f in file_list if f['title'].endswith('.csv')]
latest_file = sorted(csv_files, key=lambda x: x['title'], reverse=True)[0]

file_title = latest_file['title']
local_path = f"/tmp/{file_title}"
latest_file.GetContentFile(local_path)
print(f"✅ Downloaded latest file: {file_title}")

# --- Clean the file ---
columns_to_keep = {
    "publishedDate": "published_date",
    "releases/0/tender/title": "tender_title",
    "releases/0/tender/description": "tender_description",
    "releases/0/tender/status": "tender_status",
    "releases/0/tender/value/amount": "contract_value",
    "releases/0/tender/procurementMethod": "procurement_method",
    "releases/0/tender/tenderPeriod/endDate": "submission_deadline",
    "releases/0/tender/contractPeriod/startDate": "contract_start_date",
    "releases/0/tender/contractPeriod/endDate": "contract_end_date",
    "releases/0/buyer/name": "buyer_name",
    "releases/0/tender/suitability/sme": "sme_friendly",
    "releases/0/tender/suitability/vcse": "vcse_friendly",
    "releases/0/title": "notice_title"
}

df = pd.read_csv(local_path, low_memory=False)
df = df[list(columns_to_keep.keys())].rename(columns=columns_to_keep)
df.insert(0, "primary_key", [''.join(random.choices(string.ascii_uppercase + string.digits, k=5)) for _ in range(len(df))])
df = df.where(pd.notnull(df), None)

# --- Upload only new records ---
inserted = 0
for row in df.to_dict(orient="records"):
    pk = row["primary_key"]
    exists = supabase.table("frameworks").select("primary_key").eq("primary_key", pk).execute()
    if not exists.data:
        supabase.table("frameworks").insert(row).execute()
        inserted += 1

print(f"✅ Inserted {inserted} new records from {file_title}")
