import BottomPopup from "../../components/BottomPopup/BottomPopup";
import PointInfoCard from "../../components/PointInfoCard/PointInfoCard";
import RoutesList from "../../components/RoutesList/RoutesList";
import StopsCard from "../../components/StopsCard/StopsCard";
import TravelModeSelector from "../../components/TravelModeSelector/TravelModeSelector";

const MapHUD = ({
    stops,
    setStops,
    travelMode,
    setTravelMode,
    pointInfo,
    setPointInfo,
    handlePathVisit,
    handleStopSave,
    nodes,
    adjacency,
    nodeLookup,
    routeResult,
    selectedRoute,
    setSelectedRoute,
}) => {
    const addStop = (newStop) => {
        setStops((prev) => {
            const exists = prev.some(
                (s) =>
                    (s.click.x === newStop.click.x &&
                        s.click.y === newStop.click.y) 
                    // (s.snap?.node?.x === newStop.snap?.node?.x &&
                    //     s.snap?.node?.y === newStop.snap?.node?.y)
            );
            return exists ? prev : [...prev, newStop];
        });
        setPointInfo(null);
    };

    return (
        <>
            {stops?.length > 1 && (
                <BottomPopup open={true} title="Routes">
                    <TravelModeSelector
                        value={travelMode}
                        onChange={setTravelMode}
                    />
                    <RoutesList
                        routeResult={routeResult}
                        selectedRoute={selectedRoute}
                        setSelectedRoute={setSelectedRoute}
                    />
                </BottomPopup>
            )}
            {pointInfo && (
                <PointInfoCard
                    {...pointInfo.info}
                    onAddStop={() => addStop(pointInfo.stop)}
                    onClose={() => setPointInfo(null)}
                />
            )}
            {stops.length > 0 && (
                <StopsCard
                    stops={stops}
                    setStops={setStops}
                    handlePathVisit={handlePathVisit}
                    handleStopSave={handleStopSave}
                    nodes={nodes}
                    adjacency={adjacency}
                    nodeLookup={nodeLookup}
                />
            )}
        </>
    );
};

export default MapHUD;
