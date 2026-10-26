import { USER_RADIUS, USER_X, userColor, type LbLayout } from "./lb-layout";

export function LbUsers({
  count,
  layout,
}: {
  count: number;
  layout: LbLayout;
}) {
  return (
    <g>
      {Array.from({ length: count }, (_, userId) => (
        <g key={userId}>
          <circle
            cx={USER_X}
            cy={layout.userY(userId)}
            r={USER_RADIUS}
            fill={userColor(userId)}
          />
          <text
            x={USER_X}
            y={layout.userY(userId)}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={10}
            fontWeight={700}
            fill="#fff"
          >
            {userId}
          </text>
        </g>
      ))}
      <text
        x={USER_X}
        y={layout.height - 2}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-label)"
      >
        Users
      </text>
    </g>
  );
}
