import { Line } from "react-konva";

const MapRoutes = ({ selectedRoute, routeResult, isWalkMode, scale }) => {
    let primary = null;
    let secondary = null;

    if (selectedRoute === "shortest") {
        primary = routeResult?.shortest;
        secondary = routeResult?.alternative;
    } else if (selectedRoute === "alternative") {
        primary = routeResult?.alternative;
        secondary = routeResult?.shortest;
    } else if (selectedRoute === "noStreet") {
        primary = routeResult?.noStreet;
        secondary = routeResult?.shortest;
    }

    return (
        <>
            {/* Secondary Path */}
            {secondary?.path?.length > 0 && (
                <Line
                    points={secondary.path}
                    stroke="hsla(200, 80%, 70%, 0.8)"
                    strokeWidth={8 / scale}
                    dash={[75, 75]}
                    lineCap="round"
                    lineJoin="round"
                    listening={false}
                />
            )}

            {/* Primary Path */}
            {primary?.path?.length > 0 && (
                <Line
                    points={primary.path}
                    stroke="hsla(200, 100%, 25%, 1.00)"
                    strokeWidth={16 / scale}
                    lineCap="round"
                    lineJoin="round"
                    tension={isWalkMode ? 0 : 0.1}
                    listening={false}
                />
            )}
            {primary?.path?.length > 0 && (
                <Line
                    points={primary.path}
                    stroke="hsla(200, 100%, 50%, 1.00)"
                    strokeWidth={10 / scale}
                    lineCap="round"
                    lineJoin="round"
                    tension={isWalkMode ? 0 : 0.1}
                    listening={false}
                />
            )}
        </>
    );
};

export default MapRoutes;
