import os
import io
import json
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
from google.oauth2.credentials import Credentials
from googleapiclient.errors import HttpError
import time

def execute_with_retry(request_func, max_retries=5):
    for attempt in range(max_retries):
        try:
            return request_func()
        except HttpError as e:
            if e.resp.status in [500, 502, 503, 504, 429, 403]:
                print(f"[!] Google API Error ({e.resp.status}). Retrying {attempt+1}/{max_retries} in {2**attempt}s...")
                time.sleep(2 ** attempt)
            else:
                raise
        except Exception as e:
            print(f"[!] Unknown Error: {e}. Retrying {attempt+1}/{max_retries} in {2**attempt}s...")
            time.sleep(2 ** attempt)
    raise Exception("Max retries exceeded for Google API request.")

def download_folder(service, folder_name, parent_id, local_path):
    # Find the folder ID inside the parent
    query = f"name='{folder_name}' and '{parent_id}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false"
    results = execute_with_retry(lambda: service.files().list(q=query, spaces='drive', fields='files(id, name)').execute())
    items = results.get('files', [])
    
    if not items:
        print(f"[!] Folder '{folder_name}' not found inside parent {parent_id}.")
        return
        
    folder_id = items[0]['id']
    print(f"[*] Found folder '{folder_name}' (ID: {folder_id})")
    
    os.makedirs(local_path, exist_ok=True)
    
    # List files in the folder
    query = f"'{folder_id}' in parents and mimeType != 'application/vnd.google-apps.folder' and trashed=false"
    results = execute_with_retry(lambda: service.files().list(q=query, spaces='drive', fields='files(id, name)').execute())
    files = results.get('files', [])
    
    for f in files:
        file_id = f['id']
        file_name = f['name']
        print(f"    -> Downloading {file_name}...")
        request = service.files().get_media(fileId=file_id)
        fh = io.FileIO(os.path.join(local_path, file_name), 'wb')
        downloader = MediaIoBaseDownload(fh, request)
        done = False
        while done is False:
            status, done = execute_with_retry(lambda: downloader.next_chunk())

def main():
    creds = Credentials.from_authorized_user_file('drive_token.json')
    service = build('drive', 'v3', credentials=creds)
    
    print("--- FINDING MILLIONAIRE FOLDER ---")
    query = "name='Millionaire' and mimeType='application/vnd.google-apps.folder' and trashed=false"
    results = execute_with_retry(lambda: service.files().list(q=query, spaces='drive', fields='files(id, name)').execute())
    items = results.get('files', [])
    
    if not items:
        print("[!] FATAL: Could not find 'Millionaire' folder on Google Drive!")
        return
        
    millionaire_id = items[0]['id']
    print(f"[*] Found 'Millionaire' folder (ID: {millionaire_id})")
    
    print("--- DOWNLOADING ENGINE ---")
    download_folder(service, 'engine', millionaire_id, './')
    
    print("--- DOWNLOADING VIDEOS ---")
    download_folder(service, 'videos', millionaire_id, './public/videos')

if __name__ == '__main__':
    main()
