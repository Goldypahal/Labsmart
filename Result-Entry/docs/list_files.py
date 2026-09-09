import zipfile
import sys

def list_docx_files(path):
    try:
        with zipfile.ZipFile(path, 'r') as zf:
            for name in zf.namelist():
                print(name)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        list_docx_files(sys.argv[1])
