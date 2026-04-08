import "@esri/calcite-components/components/calcite-panel";
import "@esri/calcite-components/components/calcite-list-item";
import "@esri/calcite-components/components/calcite-shell-panel";
import "@esri/calcite-components/components/calcite-action";
import "@esri/calcite-components/components/calcite-action-bar";
import { useEffect, useState } from "react";
import "@arcgis/map-components/components/arcgis-basemap-gallery";
import "@arcgis/map-components/components/arcgis-layer-list";
import "@arcgis/map-components/components/arcgis-legend";
import "@arcgis/map-components/components/arcgis-direct-line-measurement-3d";
import "@arcgis/map-components/components/arcgis-area-measurement-3d";
import { defineActions } from "../uniqueValues";
import {
  ngcp_tagged_structureLayer,
  ngcp_working_area,
  prowOthersLayer,
  utilityLineNGCP,
} from "../layers";
import HandedOverAreaChart from "./HandedOverAreaChart";

function ActionPanel() {
  const [activeWidget, setActiveWidget] = useState(null);
  const [nextWidget, setNextWidget] = useState(null);
  const arcgisScene = document.querySelector("arcgis-scene");
  const directLineMeasure = document.querySelector(
    "arcgis-direct-line-measurement-3d",
  );
  const areaMeasure = document.querySelector("arcgis-area-measurement-3d");
  const shellPanel: any = document.getElementById("left-shell-panel");

  useEffect(() => {
    if (activeWidget) {
      const actionActiveWidget: any = document.querySelector(
        `[data-panel-id=${activeWidget}]`,
      );
      actionActiveWidget.hidden = true;
      shellPanel.collapsed = true;

      directLineMeasure
        ? directLineMeasure.clear()
        : console.log("Line measure is cleared");

      areaMeasure
        ? areaMeasure.clear()
        : console.log("Area measure is cleared");
    }

    if (nextWidget !== activeWidget) {
      const actionNextWidget: any = document.querySelector(
        `[data-panel-id=${nextWidget}]`,
      );
      actionNextWidget.hidden = false;
      shellPanel.collapsed = false;

      // Timeslider and handedOver charts do not appear in shell-panel so
      // need to collapse shell-panel manually
      if (nextWidget === "handedover-charts") {
        shellPanel.collapsed = true;
      }
    }
  });

  return (
    <>
      <calcite-shell-panel
        slot="panel-start"
        id="left-shell-panel"
        displayMode="dock"
        collapsed
        style={{ "--calcite-shell-panel-background-color": "#2b2b2b" }}
      >
        <calcite-action-bar
          slot="action-bar"
          style={{
            borderStyle: "solid",
            borderRightWidth: 3.5,
            borderLeftWidth: 5,
            borderBottomWidth: 5,
            borderColor: "#555555",
          }}
        >
          <calcite-action
            data-action-id="layers"
            icon="layers"
            text="layers"
            id="layers"
            //textEnabled={true}
            onClick={(event: any) => {
              setNextWidget(event.target.id);
              setActiveWidget(nextWidget === activeWidget ? null : nextWidget);
            }}
          ></calcite-action>

          <calcite-action
            data-action-id="basemaps"
            icon="basemap"
            text="basemaps"
            id="basemaps"
            onClick={(event: any) => {
              setNextWidget(event.target.id);
              setActiveWidget(nextWidget === activeWidget ? null : nextWidget);
            }}
          ></calcite-action>

          <calcite-action
            data-action-id="handedover-charts"
            icon="graph-bar-side-by-side"
            text="Handed-Over Area"
            id="handedover-charts"
            onClick={(event: any) => {
              setNextWidget(event.target.id);
              setActiveWidget(nextWidget === activeWidget ? null : nextWidget);
            }}
          ></calcite-action>

          <calcite-action
            data-action-id="directline-measure"
            icon="measure-line"
            text="Line Measurement"
            id="directline-measure"
            onClick={(event: any) => {
              setNextWidget(event.target.id);
              setActiveWidget(nextWidget === activeWidget ? null : nextWidget);
            }}
          ></calcite-action>

          <calcite-action
            data-action-id="area-measure"
            icon="measure-area"
            text="Area Measurement"
            id="area-measure"
            onClick={(event: any) => {
              setNextWidget(event.target.id);
              setActiveWidget(nextWidget === activeWidget ? null : nextWidget);
            }}
          ></calcite-action>

          <calcite-action
            data-action-id="information"
            icon="information"
            text="Information"
            id="information"
            onClick={(event: any) => {
              setNextWidget(event.target.id);
              setActiveWidget(nextWidget === activeWidget ? null : nextWidget);
            }}
          ></calcite-action>
        </calcite-action-bar>

        <calcite-panel heading="Layers" data-panel-id="layers" hidden>
          <arcgis-layer-list
            referenceElement="arcgis-scene"
            selectionMode="multiple"
            visibilityAppearance="checkbox"
            // show-collapse-button
            show-filter
            filter-placeholder="Filter layers"
            listItemCreatedFunction={defineActions}
            onarcgisTriggerAction={(event: any) => {
              const { id } = event.detail.action;

              if (id === "full-extent-ngcpworkarea") {
                if (ngcp_working_area.fullExtent) {
                  arcgisScene
                    ?.goTo(ngcp_working_area.fullExtent)
                    .catch((error) => {
                      if (error.name !== "AbortError") {
                        console.error(error);
                      }
                    });
                }
              } else if (id === "full-extent-taggedstructure") {
                if (ngcp_tagged_structureLayer.fullExtent) {
                  arcgisScene
                    ?.goTo(ngcp_tagged_structureLayer.fullExtent)
                    .catch((error) => {
                      if (error.name !== "AbortError") {
                        console.error(error);
                      }
                    });
                }
              } else if (id === "full-extent-ngcpline") {
                if (utilityLineNGCP.fullExtent) {
                  arcgisScene
                    ?.goTo(utilityLineNGCP.fullExtent)
                    .catch((error) => {
                      if (error.name !== "AbortError") {
                        console.error(error);
                      }
                    });
                }
              } else if (id === "full-extent-sapangbalenriver") {
                if (prowOthersLayer.fullExtent) {
                  arcgisScene
                    ?.goTo(prowOthersLayer.fullExtent)
                    .catch((error) => {
                      if (error.name !== "AbortError") {
                        console.error(error);
                      }
                    });
                }
              }
            }}
          ></arcgis-layer-list>
        </calcite-panel>

        <calcite-panel heading="Basemaps" data-panel-id="basemaps" hidden>
          <arcgis-basemap-gallery referenceElement="arcgis-scene"></arcgis-basemap-gallery>
        </calcite-panel>

        <calcite-panel
          height="l"
          data-panel-id="handedover-charts"
          hidden
        ></calcite-panel>

        <calcite-panel
          heading="Direct Line Measure"
          data-panel-id="directline-measure"
          hidden
        >
          <arcgis-direct-line-measurement-3d
            id="directLineMeasurementAnalysisButton"
            referenceElement="arcgis-scene"
            style={{
              marginLeft: "auto",
              marginRight: "auto",
            }}
          ></arcgis-direct-line-measurement-3d>
        </calcite-panel>

        <calcite-panel
          heading="Area Measure"
          data-panel-id="area-measure"
          hidden
        >
          <arcgis-area-measurement-3d
            id="AreaMeasurementAnalysisButton"
            referenceElement="arcgis-scene"
            style={{
              marginLeft: "auto",
              marginRight: "auto",
            }}
          ></arcgis-area-measurement-3d>
        </calcite-panel>

        <calcite-panel heading="Description" data-panel-id="information" hidden>
          {nextWidget === "information" ? (
            <div style={{ paddingLeft: "20px" }}>
              This smart map shows the progress on the following:
              <ul>
                <li>Land Aquisition, </li>
                <li>Structures, </li>
                <li>Housedholds (NLOs), </li>
                <li>Lots under Expropriation, </li>
              </ul>
              <div style={{ paddingLeft: "20px" }}>
                <li>
                  The source of data: <b>Master List tables</b> provided by the
                  RAP Team.
                </li>
              </div>
            </div>
          ) : (
            <div className="informationDiv" hidden></div>
          )}
        </calcite-panel>
      </calcite-shell-panel>

      {nextWidget === "handedover-charts" && nextWidget !== activeWidget && (
        <HandedOverAreaChart />
      )}
    </>
  );
}

export default ActionPanel;
