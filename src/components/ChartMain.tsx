import "@esri/calcite-components/components/calcite-tabs";
import "@esri/calcite-components/components/calcite-tab";
import "@esri/calcite-components/components/calcite-tab-nav";
import "@esri/calcite-components/components/calcite-tab-title";
import "@esri/calcite-components/components/calcite-panel";
import "@esri/calcite-components/components/calcite-shell-panel";
import "@arcgis/map-components/dist/components/arcgis-scene";
import "@arcgis/map-components/components/arcgis-scene";
import ChartLot from "./ChartLot";
import "../index.css";
import ChartStructure from "./ChartStructure";
import ChartNlo from "./ChartNlo";
import { primaryLabelColor } from "../uniqueValues";
import { useState } from "react";
import ChartTreeCutting from "./ChartTreeCutting";
import ChartTreeCompensation from "./ChartTreeCompensation";
import ChartViaduct from "./ChartViaduct";
import ChartUtilityPoint from "./ChartUtilityPoint";
import ChartUtilityLine from "./ChartUtilityLine";

function ChartMain() {
  const [panelWidth, setPanelWidth] = useState<string>("40%");
  const [panelHeader, setPanelHeader] = useState<string>("Chart");

  const handlePanelCollapse = (event: any) => {
    const collapse_state = event.target.collapsed;

    if (collapse_state) {
      setPanelWidth("50px");
      setPanelHeader("");
    } else {
      setPanelWidth("40%");
      setPanelHeader("Chart");
    }
  };

  return (
    <>
      <calcite-panel
        scale="s"
        slot="panel-end"
        collapsible
        heading={panelHeader}
        headingLevel={3}
        id="chart-panel"
        collapseDirection="up"
        style={{
          "--calcite-panel-heading-text-color": primaryLabelColor,
          borderStyle: "solid",
          borderRightWidth: 5,
          borderLeftWidth: 5,
          borderBottomWidth: 5,
          borderColor: "#555555",
          width: panelWidth,
          overflowY: "auto",
          display: "block", // without adding display, background will not disappear.
          scrollbarWidth: "none",
        }}
        // oncalcitePanelCollapse={handlePanelCollapse}
        onClick={handlePanelCollapse}
      >
        <calcite-tabs
          style={{
            // borderStyle: "solid",
            borderRightWidth: 1,
            borderLeftWidth: 1,
            borderBottomWidth: 1,
            borderColor: "#555555",
            backgroundColor: "#2b2b2b",
          }}
          layout="center"
          scale="m"
        >
          <calcite-tab-nav slot="title-group" id="thetabs">
            <calcite-tab-title className="Land">Land</calcite-tab-title>
            <calcite-tab-title className="Structure">
              Structure
            </calcite-tab-title>
            <calcite-tab-title className="Households">
              Households
            </calcite-tab-title>
            <calcite-tab-title className="Households">Tree</calcite-tab-title>
            <calcite-tab-title className="Utility">Utility</calcite-tab-title>
            <calcite-tab-title className="Viaduct">Viaduct</calcite-tab-title>
          </calcite-tab-nav>

          {/* CalciteTab: Lot */}
          <calcite-tab>
            <ChartLot />
          </calcite-tab>

          {/* CalciteTab: Structure */}
          <calcite-tab>
            <ChartStructure />
          </calcite-tab>

          {/* CalciteTab: Non-Land Owner */}
          <calcite-tab>
            <ChartNlo />
          </calcite-tab>

          {/* CalciteTab: Tree Cutting & Compensation */}
          <calcite-tab>
            <ChartTreeCutting />
            <ChartTreeCompensation />
          </calcite-tab>

          {/* CalciteTab: Viaduct */}
          <calcite-tab>
            <ChartUtilityPoint />
            <ChartUtilityLine />
          </calcite-tab>

          {/* CalciteTab: Viaduct */}
          <calcite-tab>
            <ChartViaduct />
          </calcite-tab>
        </calcite-tabs>
      </calcite-panel>
    </>
  );
}

export default ChartMain;
