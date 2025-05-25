import pandas as pd
import random
import string
import os
import requests
from datetime import datetime
from supabase import create_client

# --- Supabase Setup ---
SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_KEY"]
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- File Setup ---
today = datetime.today().strftime('%Y/%m/%d')
today_dash = datetime.today().strftime('%Y-%m-%d')
filename = f'cfnotices_cleaned_{today_dash}.csv'

# --- Download raw CSV from Contracts Finder ---
url = f"https://www.contractsfinder.service.gov.uk/Harvester/Notices/Data/CSV/{today}"
r = requests.get(url)
r.raise_for_status()

# --- Save raw content temporarily ---
raw_file = f"/tmp/raw_{today_dash}.csv"
with open(raw_file, 'wb') as f:
    f.write(r.content)

# --- Clean Columns ---
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
    "releases/0/title": "notice_title",
    "Source File": "source_file"
}

# --- Load and clean CSV ---
df = pd.read_csv(raw_file, low_memory=False)
df_cleaned = df[list(columns_to_keep.keys())].rename(columns=columns_to_keep)

# --- Add a primary key column ---
def generate_key():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))

df_cleaned.insert(0, "primary_key", [generate_key() for _ in range(len(df_cleaned))])

# --- Upload to Supabase ---
records = df_cleaned.to_dict(orient="records")
for row in records:
    supabase.table("frameworks").insert(row).execute()

print(f"✅ Uploaded {len(records)} cleaned records to Supabase.")
