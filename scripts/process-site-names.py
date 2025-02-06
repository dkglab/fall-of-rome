import csv, os, re, shutil
from tempfile import NamedTemporaryFile
from typing import Any, Generator

town_pattern: re.Pattern = r"(.+?) -- "

def process_row(row: dict[str, Any]):
    site_name = row["Site Name"]
    site_name = site_name.replace("c/", "Calle")
    towns = re.findall(town_pattern, site_name)
    towns = ",".join(towns)
    site_name = re.sub(town_pattern, "", site_name)
    row["processed"] = site_name
    row["towns"] = towns
    return row
    


def main():
    # Set working directory to located-sites data dir
    os.chdir("data/located-sites")
    with open("input.csv", "r") as csvfile, NamedTemporaryFile(mode="wt") as temp:
        reader = csv.DictReader(csvfile)
        writer = csv.DictWriter(temp, list(reader.fieldnames) + ["towns", "processed"])
        writer.writeheader()
        for row in reader:
            new_row = process_row(row)
            writer.writerow(new_row)
        shutil.copy(temp.name, "input.csv")
    

    

if __name__ == "__main__":
    main()