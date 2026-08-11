import os
import io
import json
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
from google.oauth2.credentials import Credentials

def download_folder(service, folder_name, parent_id, local_path):
    # Find the folder ID inside the parent
    query = f"name='{folder_name}' and '{parent_id}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false"
    results = service.files().list(q=query, spaces='drive', fields='files(id, name)').execute()
    items = results.get('files', [])
    
    if not items:
        print(f"[!] Folder '{folder_name}' not found inside parent {parent_id}.")
        return
        
    folder_id = items[0]['id']
    print(f"[*] Found folder '{folder_name}' (ID: {folder_id})")
    
    os.makedirs(local_path, exist_ok=True)
    
    # List files in the folder
    query = f"'{folder_id}' in parents and trashed=false"
    results = service.files().list(q=query, spaces='drive', fields='files(id, name)').execute()
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
            status, done = downloader.next_chunk()

def main():
    creds = Credentials.from_authorized_user_file('drive_token.json')
    service = build('drive', 'v3', credentials=creds)
    
    print("--- FINDING MILLIONAIRE FOLDER ---")
    query = "name='Millionaire' and mimeType='application/vnd.google-apps.folder' and trashed=false"
    results = service.files().list(q=query, spaces='drive', fields='files(id, name)').execute()
    items = results.get('files', [])
    
    if not items:
        print("[!] FATAL: Could not find 'Millionaire' folder on Google Drive!")
        return
        
    millionaire_id = items[0]['id']
    print(f"[*] Found 'Millionaire' folder (ID: {millionaire_id})")
    
    print("--- DOWNLOADING ENGINE ---")
    download_folder(service, 'engine', millionaire_id, './')
    
    print("--- DOWNLOADING VIDEOS ---")
    download_folder(service, 'videos', millionaire_id, './videos')

if __name__ == '__main__':
    main()
