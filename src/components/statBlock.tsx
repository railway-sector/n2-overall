// import { labelColor, valueColor } from "../uniqueValues";

export const labelColor = "#9ca3af";
export const valueColor = "#d1d5db";
//--------------------------------------------//
//              StatBlock                      //
//--------------------------------------------//
//  Shared dt/dd label+value pair used across the
//  chart panels (ChartLot, ChartStructure, ChartNlo).
//  Pass `unit` to render the "m²" suffix used by
//  area stats, or `labelMarginRight`/`textAlign` to
//  match a specific panel's spacing/alignment.
export function StatBlock({
  label,
  value,
  fontSize,
  valueSize,
  isLoading,
  unit,
  labelMarginRight,
}: {
  label: string;
  value: React.ReactNode;
  fontSize: number;
  valueSize: number;
  isLoading: boolean;
  unit?: boolean;
  labelMarginRight?: string;
  textAlign?: "left" | "center" | "right";
}) {
  return (
    <dl style={{ alignItems: "center" }}>
      <dt
        style={{
          color: labelColor,
          fontSize: `${fontSize}px`,
          marginRight: labelMarginRight,
        }}
      >
        {label}
      </dt>
      <dd
        style={{
          color: valueColor,
          fontSize: `${valueSize}px`,
          fontWeight: "bold",
          fontFamily: "calibri",
          lineHeight: "1.2",
          margin: "auto",
          opacity: isLoading ? 0 : 1,
          textAlign: "center",
        }}
      >
        {value}
        {unit && (
          <>
            <label style={{ fontWeight: "normal", fontSize: `${fontSize}px` }}>
              {" "}
              m
            </label>
            <label style={{ verticalAlign: "super", fontSize: "0.6rem" }}>
              2
            </label>
          </>
        )}
      </dd>
    </dl>
  );
}

export default StatBlock;
