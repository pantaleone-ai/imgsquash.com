import * as React from "react";
const Logo = (props) => (
  <svg
    width={290}
    height={100}
    viewBox="0 0 290 100"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <style>
      {
        "\n    .text-container {\n      font-family: 'Orbitron', sans-serif;\n    }\n\n    .text-img {\n      fill: url(#iconGradient);\n      font-size: 32px;\n      font-weight: 550;\n      letter-spacing: -.1em;\n    }\n\n    .text-squash {\n      fill: #ffffff;\n      font-size: 34px;\n      font-weight: 200;\n      letter-spacing: -.17em;\n    \n    }\n\n    .bg {\n      fill: url(#bgGradient);\n    }\n\n    .icon-bg {\n      fill: url(#iconGradient);\n      rx: 12;\n    }\n\n    .icon-glow {\n      filter: url(#glow);\n    }\n\n    .icon-text {\n      font-family: 'Orbitron', sans-serif;\n      fill: white;\n      opacity: 0.85;\n      font-size: 26px;\n      font-weight: bold;\n      text-anchor: middle;\n      dominant-baseline: middle;\n    }\n  "
      }
    </style>
    <defs>
      <linearGradient id="bgGradient" x1={0} y1={0} x2={0} y2={1}>
        <stop offset="0%" stopColor="#0d0d0d" />
        <stop offset="100%" stopColor="#1a1a1a" />
      </linearGradient>
      <linearGradient id="iconGradient" x1={0} y1={0} x2={1} y2={1}>
        <stop offset="0%" stopColor="#00eaff" />
        <stop offset="100%" stopColor="#0077ff" />
      </linearGradient>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation={5} result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <rect className="bg" width={273} height={100} rx={20} />
    <rect x={20} y={25} width={60} height={50} className="icon-bg icon-glow" />
    <text x={50} y={51} className="icon-text">
      {"> | <"}
    </text>
    <g className="text-container" transform="translate(94, 63)">
      <text className="text-img" y={0}>
        <tspan x={0}>{"i"}</tspan>
        <tspan dx="">{"m"}</tspan>
        <tspan dx="">{"g"}</tspan>
      </text>
      <text className="text-squash" y={0}>
        <tspan x={66}>{"s"}</tspan>
        <tspan x="">{"q"}</tspan>
        <tspan x="">{"u"}</tspan>
        <tspan x="">{"a"}</tspan>
        <tspan x="">{"s"}</tspan>
        <tspan x="">{"h"}</tspan>
      </text>
    </g>
  </svg>
);
export default Logo;
