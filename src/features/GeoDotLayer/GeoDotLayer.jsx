import React, { useEffect, useRef, useState } from "react";
import { Stage, Layer, Circle, Text } from "react-konva";
import { latLonToPixel } from "../../utils/mapHelper";

export default function GeoDotLayer() {
    const watchIdRef = useRef(null);

    const [geo, setGeo] = useState({
        lat: null,
        lon: null,
        accuracy: null,
        error: null,
    });

    const [dot, setDot] = useState({ x: null, y: null });

    useEffect(() => {
        if (!("geolocation" in navigator)) {
            setGeo((g) => ({
                ...g,
                error: "Geolocation is not supported in this browser.",
            }));
            return;
        }

        // Start watching location
        watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude, accuracy } = pos.coords;

                setGeo({
                    lat: latitude,
                    lon: longitude,
                    accuracy,
                    error: null,
                });
                console.log(latitude, longitude, accuracy);

                // Convert to map coordinates (temporary calibration)
                const { x, y } = latLonToPixel(latitude, longitude);
                setDot({ x, y });
            },
            (err) => {
                setGeo((g) => ({ ...g, error: err.message }));
            },
            {
                enableHighAccuracy: true,
                maximumAge: 500, // ms: allow a tiny cache
                timeout: 8000,
            }
        );

        // Cleanup
        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, []);

    return (
        <>
            <Layer>
                {/* Debug text */}
                <Text
                    x={10}
                    y={10}
                    text={
                        geo.error
                            ? `Geo error: ${geo.error}`
                            : geo.lat
                              ? `lat=${geo.lat.toFixed(6)} lon=${geo.lon.toFixed(6)} acc=${Math.round(geo.accuracy)}m`
                              : "Waiting for location..."
                    }
                    fontSize={16}
                    fill="white"
                />

                {/* User dot */}
                {dot.x !== null && dot.y !== null && (
                    <Circle
                        x={dot.x}
                        y={dot.y}
                        radius={10}
                        fill="deepskyblue"
                        stroke="white"
                        strokeWidth={2}
                        shadowBlur={10}
                    />
                )}
            </Layer>
        </>
    );
}
