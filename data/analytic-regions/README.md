# Analytic regions

`analytic-regions.csv` was created with the following command:

```sh
qsv frequency data/located-sites/located-sites.csv \
--select "New Regions" \
--limit 0 \
> data/analytic-regions/analytic-regions.csv
```
