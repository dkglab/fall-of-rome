import TileMap from "./tile-map"

function main() {
  ;(async function () {
    const map = document.getElementById("map") as TileMap
    await map.showFeatures({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            coordinates: [-7, 42],
            type: "Point",
          },
        },
        {
          type: "Feature",
          properties: {},
          geometry: {
            coordinates: [-2, 37],
            type: "Point",
          },
        },
      ],
    })
  })()
}

main()
