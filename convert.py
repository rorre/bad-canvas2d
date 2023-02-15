import json
import pickle
import sys
import zlib

from frames2osb.pixels.typings import PixelData

print("Loading pickle data...")
with open(sys.argv[1], "rb") as f:
    pixel_data: PixelData = pickle.load(f)

print("Converting to JSON...")
json_str = json.dumps(pixel_data)
del pixel_data

print("Cleaning unused data...")
json_str = json_str.replace(",null", "")

print("Compressing with GZip...")
with open("frames.gz", "wb") as f:
    f.write(zlib.compress(json_str.encode()))

print("Done!")
