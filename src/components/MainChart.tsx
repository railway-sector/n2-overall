import "@esri/calcite-components/components/calcite-tabs";
import "@esri/calcite-components/components/calcite-tab";
import "@esri/calcite-components/components/calcite-tab-nav";
import "@esri/calcite-components/components/calcite-tab-title";
import "@esri/calcite-components/components/calcite-panel";
import "@esri/calcite-components/components/calcite-shell-panel";
import "@arcgis/map-components/dist/components/arcgis-scene";
import "@arcgis/map-components/components/arcgis-scene";
import LotChart from "./LotChart";
import "../index.css";
import StructureChart from "./StructureChart";
import NloChart from "./NloChart";
import { primaryLabelColor } from "../uniqueValues";
import { useState } from "react";
import TreeCuttingChart from "./TreeCuttingChart";
import TreeCompensationChart from "./TreeCompensationChart";
import ViaductChart from "./ViaductChart";
import UtilityPointChart from "./UtilityPointChart";
import UtilityLineChart from "./UtilityLineChart";

function MainChart() {
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
            <LotChart />
          </calcite-tab>

          {/* CalciteTab: Structure */}
          <calcite-tab>
            <StructureChart />
          </calcite-tab>

          {/* CalciteTab: Non-Land Owner */}
          <calcite-tab>
            <NloChart />
          </calcite-tab>

          {/* CalciteTab: Tree Cutting & Compensation */}
          <calcite-tab>
            <TreeCuttingChart />
            <TreeCompensationChart />
          </calcite-tab>

          {/* CalciteTab: Viaduct */}
          <calcite-tab>
            <UtilityPointChart />
            <UtilityLineChart />
          </calcite-tab>

          {/* CalciteTab: Viaduct */}
          <calcite-tab>
            <ViaductChart />
          </calcite-tab>
        </calcite-tabs>
      </calcite-panel>
    </>
  );
}

export default MainChart;
