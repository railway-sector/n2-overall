import "@arcgis/map-components/components/arcgis-expand";
import "@arcgis/map-components/components/arcgis-legend";
import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-scene";
import "@arcgis/map-components/components/arcgis-search";
import "@arcgis/map-components/components/arcgis-zoom";
import "@esri/calcite-components/components/calcite-shell";
import "@esri/calcite-components/components/calcite-navigation";
import "@esri/calcite-components/components/calcite-navigation-logo";
import type { ArcgisScene } from "@arcgis/map-components/components/arcgis-scene";
import {
  structureLayer,
  pierAccessLayer,
  prowLayer,
  handedOverLotLayer,
  viaductLayer,
  buildingLayer,
  utilityGroupLayer,
  treeGroupLayer,
  lotGroupLayer,
  ngcp2_groupLayer,
  nloLoOccupancyGroupLayer,
  alignmentGroupLayer,
  lotLayer,
  pierHeadColumnLayer,
  // maintenanceRoadLayer,
} from "../layers";
import type { ArcgisSearch } from "@arcgis/map-components/components/arcgis-search";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";

export default function MapDisplay() {
  const arcgisScene = document.querySelector("arcgis-scene") as ArcgisScene;
  const arcgisSearch = document.querySelector("arcgis-search") as ArcgisSearch;

  reactiveUtils.watch(
    () => viaductLayer.visible,
    (visible) => {
      if (visible) {
        pierHeadColumnLayer.visible = false;
      } else {
        pierHeadColumnLayer.visible = true;
      }
    },
  );

  arcgisScene?.viewOnReady(() => {
    arcgisScene?.map?.add(buildingLayer);
    arcgisScene?.map?.add(viaductLayer);
    arcgisScene?.map?.add(pierAccessLayer);
    arcgisScene?.map?.add(utilityGroupLayer);
    arcgisScene?.map?.add(treeGroupLayer);
    arcgisScene?.map?.add(lotGroupLayer);
    arcgisScene?.map?.add(ngcp2_groupLayer);
    arcgisScene?.map?.add(structureLayer);
    arcgisScene?.map?.add(nloLoOccupancyGroupLayer);
    arcgisScene?.map?.add(alignmentGroupLayer);
    arcgisScene?.map?.add(prowLayer);
    arcgisScene?.map?.add(handedOverLotLayer);
    // arcgisScene?.map?.add(maintenanceRoadLayer);

    // Search components
    const sources: any = [
      {
        layer: lotLayer,
        searchFields: ["LotID"],
        displayField: "LotID",
        exactMatch: false,
        outFields: ["LotID"],
        name: "Lot ID",
        placeholder: "example: 10083",
      },
      {
        layer: structureLayer,
        searchFields: ["StrucID"],
        displayField: "StrucID",
        exactMatch: false,
        outFields: ["StrucID"],
        name: "Structure ID",
        placeholder: "example: NSRP-01-02-ML007",
      },
      {
        layer: pierAccessLayer,
        searchFields: ["PierNumber"],
        displayField: "PierNumber",
        exactMatch: false,
        outFields: ["PierNumber"],
        name: "Pier No",
        zoomScale: 1000,
        placeholder: "example: P-288",
      },
    ];

    arcgisSearch.allPlaceholder = "LotID, StructureID, Chainage";
    arcgisSearch.includeDefaultSourcesDisabled = true;
    arcgisSearch.locationDisabled = true;
    arcgisSearch?.sources.push(...sources);
    arcgisScene.hideAttribution = true;
    arcgisScene.view.environment.atmosphereEnabled = false;
    arcgisScene.view.environment.starsEnabled = false;
    if (arcgisScene?.map?.ground) {
      arcgisScene.map.ground.navigationConstraint = { type: "none" };
      arcgisScene.map.ground.opacity = 0.7;
    }
  });

  return (
    <>
      <arcgis-scene
        basemap="dark-gray-vector"
        ground="world-elevation"
        viewingMode="local"
        center="120.5793, 15.18"
        zoom={10}
      >
        <arcgis-compass slot="top-right"></arcgis-compass>
        <arcgis-expand close-on-esc slot="top-right" mode="floating">
          <arcgis-search></arcgis-search>
        </arcgis-expand>
        <arcgis-zoom slot="bottom-right"></arcgis-zoom>
      </arcgis-scene>
    </>
  );
}
