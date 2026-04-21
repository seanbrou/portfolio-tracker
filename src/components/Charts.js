
import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Svg, { Path, Line, Defs, LinearGradient, Stop, Circle, Rect } from "react-native-svg";

const { width: SCREEN_W } = Dimensions.get("window");
const CHART_H = 220;
const PAD = 10;

export function AreaChart({ data, color = "#00D4AA", height = CHART_H, showLabels = true, formatValue }) {
  if (!data || data.length < 2) return <Text style={{color:'#888'}}>No data</Text>;

  const vals = data.map(d => d.value != null ? d.value : d.price);
  const labels = data.map(d => d.date);
  const minV = Math.min(...vals);
  const maxV = Math.max(...vals);
  const rangeV = maxV - minV || 1;

  const chartW = SCREEN_W - PAD * 2;

  const points = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * chartW;
    const y = height - ((v - minV) / rangeV) * (height - 40) - 20;
    return { x, y };
  });

  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2;
    pathD += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
  }

  const areaD = pathD + ` L ${points[points.length-1].x} ${height} L ${points[0].x} ${height} Z`;

  const lastVal = vals[vals.length - 1];
  const firstVal = vals[0];
  const change = lastVal - firstVal;
  const changePct = ((change / firstVal) * 100).toFixed(2);
  const isUp = change >= 0;
  const lineColor = isUp ? "#00D4AA" : "#FF4D4F";

  return (
    <View style={{ width: SCREEN_W }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: PAD, marginBottom: 4 }}>
        <Text style={{ color: lineColor, fontSize: 22, fontWeight: "700" }}>
          {formatValue ? formatValue(lastVal) : lastVal.toFixed(2)}
        </Text>
        <Text style={{ color: lineColor, fontSize: 14, fontWeight: "600" }}>
          {isUp ? "+" : ""}{formatValue ? formatValue(change) : change.toFixed(2)} ({isUp ? "+" : ""}{changePct}%)
        </Text>
      </View>
      <Svg width={SCREEN_W} height={height}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={lineColor} stopOpacity="0.3" />
            <Stop offset="1" stopColor={lineColor} stopOpacity="0.0" />
          </LinearGradient>
        </Defs>
        <Path d={areaD} fill="url(#grad)" />
        <Path d={pathD} fill="none" stroke={lineColor} strokeWidth="2.5" />
        <Circle cx={points[points.length-1].x} cy={points[points.length-1].y} r="4" fill={lineColor} />
      </Svg>
      {showLabels && (
        <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: PAD, marginTop: 4 }}>
          <Text style={{ color: "#666", fontSize: 11 }}>{labels[0]}</Text>
          <Text style={{ color: "#666", fontSize: 11 }}>{labels[Math.floor(labels.length / 2)]}</Text>
          <Text style={{ color: "#666", fontSize: 11 }}>{labels[labels.length - 1]}</Text>
        </View>
      )}
    </View>
  );
}

export function DonutChart({ data, size = 180 }) {
  // data: [{ label, value, color }]
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;

  const radius = size / 2 - 10;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  let acc = 0;

  const segments = data.map(d => {
    const pct = d.value / total;
    const dashLen = pct * circumference;
    const dashOff = -acc * circumference;
    acc += pct;
    return { ...d, pct, dashLen, dashOff };
  });

  return (
    <View style={{ alignItems: "center" }}>
      <Svg width={size} height={size}>
        {segments.map((s, i) => (
          <Circle
            key={i}
            cx={cx}
            cy={cy}
            r={radius}
            fill="transparent"
            stroke={s.color}
            strokeWidth="24"
            strokeDasharray={`${s.dashLen} ${circumference - s.dashLen}`}
            strokeDashoffset={s.dashOff}
            rotation="-90"
            origin={`${cx}, ${cy}`}
          />
        ))}
        <Text x={cx} y={cy - 8} textAnchor="middle" fill="#FFF" fontSize="16" fontWeight="700">
          ${total.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        </Text>
        <Text x={cx} y={cy + 14} textAnchor="middle" fill="#888" fontSize="11">
          Total Value
        </Text>
      </Svg>
      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", marginTop: 12 }}>
        {data.map((d, i) => (
          <View key={i} style={{ flexDirection: "row", alignItems: "center", marginHorizontal: 8, marginBottom: 4 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: d.color, marginRight: 4 }} />
            <Text style={{ color: "#CCC", fontSize: 12 }}>
              {d.label} ({((d.value / total) * 100).toFixed(0)}%)
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
