import zipfile
import json
with zipfile.ZipFile('PathLab_LIMS_SRS_v1.0.docx') as zf:
    print(json.dumps(zf.namelist(), indent=2))
