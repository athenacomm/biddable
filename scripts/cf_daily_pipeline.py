import pandas as pd
import random
import string
import os
import requests
from datetime import datetime
from supabase import create_client

# Supabase init
SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_KEY"]
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Date setup
today = datetime.today()
url_date = today.strftime("%Y/%m/%d")
file_stamp = today.strftime("%Y-%m-%d")

# Download CSV
url = f"https://www.contractsfinder.service.gov.uk/Harvester/Notices/Data/CSV/{url_date}"
response = requests.get(url)
response.raise_for_status()

# Save to /tmp
raw_path = f"/tmp/cf_raw_{file_stamp}.csv"
with open(raw_path, "wb") as f:
    f.write(response.content)

# Define columns
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

# Clean + upload
df = pd.read_csv(raw_path, low_memory=False)
df_cleaned = df[list(columns_to_keep.keys())].rename(columns=columns_to_keep)
df_cleaned.insert(0, "primary_key", [''.join(random.choices(string.ascii_uppercase + string.digits, k=5)) for _ in range(len(df_cleaned))])

# Upload
for row in df_cleaned.to_dict(orient="records"):
    supabase.table("frameworks").insert(row).execute()

print(f"✅ Uploaded {len(df_cleaned)} records from {file_stamp}")
