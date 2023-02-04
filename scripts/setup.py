#!/usr/bin/env python3

import requests
from zipfile import ZipFile
from argparse import ArgumentParser
import json
from os import remove, path, walk
from shutil import move


TMP_ZIP = "sheets.zip" # filename for the temporary zip file
RAW_FOLDER = "public/raw" # folder for the extracted sheets
CRD_LIST = "src/sheet_list.json" # path of list of all sheets


# the usual argument parser
parser = ArgumentParser()
parser.add_argument('cloud', type=str, help="link to cloud storage with sheets")
args = parser.parse_args()


# download zipped sheets
headers = {
    'X-Requested-With': 'XMLHttpRequest',
}
response = requests.get(args.cloud, headers=headers)
with open(TMP_ZIP, 'wb') as fh:
   fh.write( response.content )


# extract zipped sheets
with ZipFile(TMP_ZIP, "r") as zip:
    # ugly way to rename the zip-included folder
    zip_foldername = zip.filelist[0].filename
    outer_foldername = path.split(RAW_FOLDER)[0]

    zip.extractall(path=outer_foldername)
    move(path.join(outer_foldername, zip_foldername), RAW_FOLDER)

    # generate list of files for loading in app
    filelist = []
    for root, dirs, files in walk(RAW_FOLDER):
        for f in files:
            if path.splitext(f)[1] == ".crd":
                filelist.append(path.relpath(path.join(root, f), RAW_FOLDER))
    filelist.sort()
    with open(path.join(CRD_LIST), "w") as f:
        f.write(json.dumps({"files": filelist}))

# remove temporary zip file
remove(TMP_ZIP)
