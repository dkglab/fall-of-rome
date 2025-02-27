# Graphing the Material Fall of the Roman Empire

Publishing historical data and argumentation as a knowledge graph.

See the [wiki](https://github.com/dkglab/fall-of-rome/wiki).

## Constructing the graph

Run `make all` to create Turtle files in the `graph` subdirectory from
the CSV files in the `data` directory.

To rebuild from scratch, run `make clean all`.

## Querying the graph

Run `make run-query` to run the query in `queries/geosparql.rq`
against `graph/located-sites.ttl`.

To run a different query, set the `QUERY` environment variable:

```sh
QUERY=queries/my-query.rq make run-query
```

Running a query starts a GeoSPARQL server running on port 3030. To
stop the server, run `make -C tools/geosparql stop`.

If the GeoSPARQL server seems to be down, you can restart it with
`make restart-geosparql-server`.

## Building and serving the Web site

Run `make serve-site` to build the static Web site under
`snowman/site/` and serve it at <http://127.0.0.1:8000/>.

## Serving the KOS documentation

Run `serve-kos` to serve the HTML files in `kos/`, documenting our
SKOS taxonomies, at <http://127.0.0.1:8001/>.
