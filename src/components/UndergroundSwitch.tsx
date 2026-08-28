import "../index.css";
import "@esri/calcite-components/dist/components/calcite-switch";
import { useEffect, useState } from "react";

function UndergroundSwitch() {
  const arcgisScene = document.querySelector("arcgis-scene");
  const [underground, setUnderground] = useState(false);

  useEffect(() => {
    if (arcgisScene?.map?.ground) {
      arcgisScene.map.ground.opacity = underground === true ? 1 : 0.7;
    }
  }, [underground]);

  return (
    <div slot="bottom-right">
      <div
        style={{
          color: "white",
          backgroundColor: "#2b2b2b",
          paddingLeft: 5,
          paddingRight: 5,
          paddingTop: 4,
          paddingBottom: 4,
          borderStyle: "solid",
          borderWidth: 0.5,
          borderColor: "#555555",
          borderRadius: "17px",
          whiteSpace: "nowrap",
        }}
      >
        Ground: {""}
        off{" "}
        <calcite-switch
          oncalciteSwitchChange={(event: any) =>
            setUnderground(event.target.checked)
          }
        ></calcite-switch>{" "}
        on
      </div>
    </div>
  );
}

export default UndergroundSwitch;
