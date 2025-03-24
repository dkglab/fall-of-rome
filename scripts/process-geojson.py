import json
import sys
from geomet import wkt

def main():
    data = json.load(sys.stdin)
    for feature in data["features"]:
        feature["geometry"] = wkt.dumps(feature["geometry"])
    json.dump(data, sys.stdout)

if __name__ == "__main__":
    main()