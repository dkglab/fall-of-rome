import csv, os, re, shutil, sys
from tempfile import NamedTemporaryFile
from typing import Any

town_pattern: re.Pattern = re.compile(r"(.+?) -- ")


def process_row(row: dict[str, Any]):
    row["Site Name"] = row["Site Name"].replace("\n", " ")
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
    reader = csv.DictReader(sys.stdin)
    assert reader.fieldnames is not None
    writer = csv.DictWriter(
        sys.stdout, list(reader.fieldnames) + ["towns", "processed"]
    )
    writer.writeheader()
    for row in reader:
        writer.writerow(process_row(row))


if __name__ == "__main__":
    main()
