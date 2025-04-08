import type { FeatureCollection } from "geojson"
import type { GeoJSONSource, LngLatBoundsLike, LngLatLike, MapMouseEvent } from "maplibre-gl"

import maplibregl from "maplibre-gl"
import bbox from "@turf/bbox"
import * as pmtiles from "pmtiles"

const DEFAULT_ZOOM = 5.5
const DEFAULT_CENTER = [-3.7, 40.4] as LngLatLike
const PMTILES_URL = "https://fly.storage.tigris.dev/cawm-pmtiles/cawm.pmtiles"

// 确保索引签名是字符串类型
const CERAMIC_COLORS: { [key: string]: string } = {
  "all": "#333333",
  "TSH": "#e41a1c",
  "TSHT": "#377eb8",
  "TSG": "#4daf4a",
  "ARS": "#ff7f00",
  "LRC": "#984ea3",
  "PRCW": "#ffff33"
}

class TileMap extends HTMLElement {
  placeTypeLayerNames: string[] = []
  map: maplibregl.Map | null = null
  currentCeramicFilter: string = "all"
  currentPeriodFilter: string = "all"
  currentSiteTypeFilter: string = "all"
  popup: maplibregl.Popup | null = null

  constructor() {
    super()
    this.attachShadow({ mode: "open" })
  }

  async connectedCallback() {
    this.render()

    const protocol = new pmtiles.Protocol()
    maplibregl.addProtocol("pmtiles", protocol.tile)

    const tileserver = new pmtiles.PMTiles(PMTILES_URL)
    protocol.add(tileserver)

    const header = await tileserver.getHeader()
    const container = this.shadowRoot!.getElementById(this.id)!

    this.map = new maplibregl.Map({
      container,
      minZoom: header.minZoom,
      maxZoom: 9,
      zoom: DEFAULT_ZOOM,
      center: DEFAULT_CENTER,
      style: {
        version: 8,
        sources: {
          cawm: {
            type: "raster",
            url: `pmtiles://${PMTILES_URL}`,
          },
          places: {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: [],
            },
          },
        },
        layers: [
          {
            id: "tiles",
            type: "raster",
            source: "cawm",
          },
          {
            id: "points",
            type: "circle",
            source: "places",
            filter: ["==", ["geometry-type"], "Point"],
            paint: {
              "circle-radius": 5,
              "circle-color": "#333333",
              "circle-stroke-width": 1,
              "circle-stroke-color": "#ffffff",
            },
          },
        ],
      },
    })

    // 添加点击事件
    this.map.on('click', 'points', this.handleMapClick.bind(this))
    
    // 鼠标悬停效果
    this.map.on('mouseenter', 'points', () => {
      if (this.map) this.map.getCanvas().style.cursor = 'pointer'
    })
    
    this.map.on('mouseleave', 'points', () => {
      if (this.map) this.map.getCanvas().style.cursor = ''
    })
    
    // 监听筛选事件
    this.addEventListener('period-change', ((e: Event) => {
      const customEvent = e as CustomEvent;
      this.currentPeriodFilter = customEvent.detail.period;
      this.updateFilters();
    }) as EventListener);
    
    this.addEventListener('ceramic-filter-change', ((e: Event) => {
      const customEvent = e as CustomEvent;
      this.currentCeramicFilter = customEvent.detail.type;
      this.updateFilters();
      this.updatePointColors();
    }) as EventListener);
    
    this.addEventListener('site-filter-change', ((e: Event) => {
      const customEvent = e as CustomEvent;
      this.currentSiteTypeFilter = customEvent.detail.type;
      this.updateFilters();
    }) as EventListener);
  }

  render() {
    this.shadowRoot!.innerHTML = `
      <link rel="stylesheet" href="/maplibre-gl.css">
      <style>
        #${this.id} { 
          height: 100%; 
        }
        .maplibregl-popup {
          max-width: 300px;
          font: 12px/20px 'Helvetica Neue', Arial, Helvetica, sans-serif;
        }
      </style>
      <div id="${this.id}"></div>
    `
  }

  handleMapClick(e: MapMouseEvent) {
    if (!this.map) return
    
    // 显示点击的遗址信息
    const features = this.map.queryRenderedFeatures(e.point, { layers: ['points'] })
    
    if (!features.length) return
    
    const feature = features[0]
    const props = feature.properties || {}
    
    // 创建弹出窗口内容
    const ceramicTypes = ['TSH', 'TSHT', 'TSG', 'ARSA', 'ARSC', 'ARSD', 'LRC', 'LRD', 'PRCW']
    const presentCeramics = ceramicTypes
      .filter(type => props[type] === 1)
      .join(', ')
    
    let html = `
      <h3>${props.name || 'Unnamed site'}</h3>
      <p>类型: ${props.siteType || '未知'}</p>
      <p>分析类型: ${props.analysisType || '未知'}</p>
      <p>陶瓷类型: ${presentCeramics || '无数据'}</p>
    `
    
    // 如果已有弹窗，先移除
    if (this.popup) this.popup.remove()
    
    // 创建新的弹窗 - 修复coordinates类型问题
    this.popup = new maplibregl.Popup()
      .setLngLat((feature.geometry as any).coordinates as [number, number])
      .setHTML(html)
      .addTo(this.map)
  }

  updateFilters() {
    if (!this.map) return
    
    // 创建正确类型的筛选器数组
    const baseFilter = ["==", ["geometry-type"], "Point"];
    let combinedFilters: any[] = [baseFilter];
    
    // 添加陶瓷类型筛选
    if (this.currentCeramicFilter !== 'all') {
      combinedFilters.push(['==', ['get', this.currentCeramicFilter], 1]);
    }
    
    // 添加遗址类型筛选
    if (this.currentSiteTypeFilter !== 'all') {
      combinedFilters.push(['==', ['get', 'siteType'], this.currentSiteTypeFilter]);
    }
    
    // 使用all包装多个条件（如果有多个条件）
    const finalFilter = combinedFilters.length > 1 ? 
      ['all', ...combinedFilters] : combinedFilters[0];
    
    // 应用筛选，使用类型断言避免TypeScript错误
    this.map.setFilter('points', finalFilter as any);
  }

  updatePointColors() {
    if (!this.map) return
    
    // 使用类型断言确保索引访问正确
    const color = CERAMIC_COLORS[this.currentCeramicFilter] || CERAMIC_COLORS.all
    
    this.map.setPaintProperty('points', 'circle-color', color)
  }

  async getPlacesSource(): Promise<GeoJSONSource> {
    while (true) {
      if (this.map) {
        const source = this.map.getSource("places")
        if (source !== undefined) {
          return source as GeoJSONSource
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }

  async showFeatures(collection: FeatureCollection) {
    const source = await this.getPlacesSource()
    source.setData(collection)

    if (this.map) {
      if (collection.features.length > 0) {
        // 使用类型断言避免bbox类型问题
        const extent = bbox(collection) as unknown as LngLatBoundsLike
        this.map.fitBounds(extent, { padding: 150 })
      } else {
        this.map.flyTo({ center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM })
      }
    }
  }
}

customElements.define("tile-map", TileMap)

export default TileMap