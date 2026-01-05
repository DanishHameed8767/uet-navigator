import BottomPopup from "../../components/BottomPopup/BottomPopup";
import FilterBar from "../../components/FilterBar/FilterBar";
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
    routeResult,
    selectedRoute,
    setSelectedRoute,
    filter,
    setFilter,
    isSearchFocus,
}) => {
    const addStop = (newStop) => {
        setStops((prev) => {
            const exists = prev.some(
                (s) =>
                    s.click.x === newStop.click.x &&
                    s.click.y === newStop.click.y
            );
            return exists ? prev : [...prev, newStop];
        });
        setPointInfo(null);
    };

    return (
        <>
            <FilterBar filter={filter} setFilter={setFilter} />
            {!isSearchFocus && stops?.length >= 1 && (
                <BottomPopup
                    open={true}
                    title={stops.length > 1 ? "Routes" : "Travel Mode"}
                >
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
                />
            )}
        </>
    );
};

export default MapHUD;
