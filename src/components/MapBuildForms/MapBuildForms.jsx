import styles from "./MapBuildForms.module.css";

const MapBuildForms = ({
    travelMode,
    selectedNode,
    tempNode,
    updateTempNode,
    nodeInputRef,
    saveNode,
    tempEdge,
    updateTempEdge,
    edgeInputRef,
    saveEdge,
}) => {
    return (
        <>
            {travelMode !== "walk" && (
                <form
                    className={
                        styles["dev-form"] + " " + styles["dev-form-node"]
                    }
                    onSubmit={(e) => saveNode(e)}
                >
                    <input
                        ref={nodeInputRef}
                        value={tempNode.name}
                        type="text"
                        placeholder="Node Name"
                        onChange={(e) => updateTempNode("name", e.target.value)}
                    />
                    <select
                        value={tempNode.type}
                        onChange={(e) => updateTempNode("type", e.target.value)}
                        required
                    >
                        <option value="" disabled>
                            Select Node Type
                        </option>
                        <option value="cafe">Cafe (Center)</option>
                        <option value="hostel">Hostel (Center)</option>
                        <option value="dept">Department (Center)</option>
                        <option value="ground">Ground (Center)</option>
                        <option value="worship">Worship Place (Center)</option>
                        <option value="wall">Wall (Building corners)</option>
                        <option value="service">
                            Entrance, Gate, Office, Library, Services
                        </option>
                        <option value="intersection">Road, Street, etc.</option>
                        <option value="other">Other</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Tier"
                        value={tempNode.tier}
                        disabled
                        required
                    />
                    <input
                        type="text"
                        placeholder="Longitude"
                        value={tempNode.lon}
                        disabled
                        required
                    />
                    <input
                        type="text"
                        placeholder="Latitude"
                        value={tempNode.lat}
                        disabled
                        required
                    />
                    <button type="submit">Save Node</button>
                </form>
            )}
            {travelMode !== "walk" && (
                <form
                    className={
                        styles["dev-form"] + " " + styles["dev-form-edge"]
                    }
                    onSubmit={(e) => {
                        saveEdge(e);
                    }}
                >
                    <input
                        ref={edgeInputRef}
                        type="text"
                        placeholder="Edge Name"
                        onChange={(e) => updateTempEdge("name", e.target.value)}
                    />
                    <select
                        value={tempEdge.type}
                        onChange={(e) => updateTempEdge("type", e.target.value)}
                        required
                    >
                        <option value="" disabled>
                            Select Edge Type
                        </option>
                        <option value="road">Road</option>
                        <option value="street">Street</option>
                        <option value="wall">Wall</option>
                    </select>

                    <label>
                        <input
                            type="checkbox"
                            checked={tempEdge.twoWay}
                            onChange={(e) =>
                                updateTempEdge("twoWay", e.target.checked)
                            }
                        />
                        Two-way edge
                    </label>
                    <input
                        type="number"
                        placeholder="Distance"
                        value={tempEdge.dist}
                        disabled
                        required
                    />
                    <div>
                        <input
                            type="text"
                            placeholder="From"
                            value={tempEdge.from}
                            disabled
                            required
                        />
                        <input
                            type="text"
                            placeholder="To"
                            value={tempEdge.to}
                            disabled
                            required
                        />
                    </div>
                    <button type="submit">Save Edge</button>
                </form>
            )}
            {travelMode !== "walk" && (
                <p id="debug">
                    {(selectedNode ? `Selected ` : `Next `) +
                        `Node [ Id: ${tempNode.id} ]`}
                </p>
            )}
        </>
    );
};

export default MapBuildForms;
