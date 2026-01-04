import { Image as KonvaImage, Path } from "react-konva";

const MapMarker = ({ x, y, color, stroke, scale }) => {
    const iconPath =
        "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z";

    return (
        <Path
            x={x}
            y={y}
            data={iconPath}
            fill={color}
            stroke={stroke}
            strokeWidth={0.5}
            offsetX={12}
            offsetY={24}
            scaleX={(1 / scale) * 1.5}
            scaleY={(1 / scale) * 1.5}
        />
    );
};
export default MapMarker;
