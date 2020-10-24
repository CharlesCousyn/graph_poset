let fileJSON;
let loadedConfig;
let graph;

let GENERAL_CONFIG =
    {
        cuttingGraphLimit: 25,
        substractingEdges: false
    };

window.addEventListener("load",() =>
{
    document.getElementById('loadFileButton')
        .addEventListener(
            'change',
            evt =>
            {
                let files = evt.target.files;
                let file = files[0];
                let reader = new FileReader();
                reader.onload = event =>
                {
                    fileJSON = JSON.parse(event.target.result);

                    updateSelectActivity(fileJSON);

                    //Listener select criterion
                    const selectActivity = document.getElementById("selectActivity");
                    selectActivity.addEventListener("change",
                        () =>
                        {
                            loadedConfig = fileJSON.find(activityResult => activityResult.activityName === selectActivity.options[selectActivity.selectedIndex].value);
                            //updateSelectActivity(loadedConfig);

                            console.log("loadedConfig", loadedConfig);
                            loadGraph(numPOSETtoGraphJSON(loadedConfig));
                        });
                };

                reader.readAsText(file);
            });


});

function updateSelectActivity(fileJson)
{
    console.log("fileJson", fileJson);
    //Update select criterion to sort
    const selectActivity = document.getElementById("selectActivity");
    let optionsHTMLActivity= ["<option value='' selected disabled hidden>Choose activity</option>", ...fileJson.map(obj => `<option${name === 0 ? " selected" : ""} value='${obj.activityName}'> ${obj.activityName}</option>`)];
    selectActivity.innerHTML = optionsHTMLActivity.join("");
}

function numPOSETtoGraphJSON(activityRes)
{
    let nodes = activityRes.numPOSET._elementsIds.map((id, index) =>
    {
        return {id: id, label: id, index: index};
    });


    let edges = activityRes.numPOSET._matrix.flatMap((line, indexLine, arr) =>
        line.map((value, indexCol) =>
        {
            //Computing edge value
            let valueEdge = 0;
            if(GENERAL_CONFIG.substractingEdges)
            {
                let symValue = arr[indexCol][indexLine];
                valueEdge = value - symValue;
            }
            else
            {
                valueEdge = value;
            }

            //Choosing if there's an edge or not
            if(valueEdge > 0 && value !== null)
            {
                return {
                    source: nodes[indexLine].id,
                    target: nodes[indexCol].id,
                    label: valueEdge,
                    indexSource: indexLine,
                    indexTarget: indexCol,
                    relatedness: valueEdge,
                    style: {
                        endArrow: true,
                        startArrow: false,
                        lineWidth: 3 + valueEdge*0.75,
                        opacity: 0.6
                    }
                };
            }
            return undefined;
        })
        .filter(value => value !== undefined));

    //Cut the graph, limit the number of nodes
    nodes = nodes.filter(node => node.index < GENERAL_CONFIG.cuttingGraphLimit);
    edges = edges.filter(edge => edge.indexSource < GENERAL_CONFIG.cuttingGraphLimit && edge.indexTarget < GENERAL_CONFIG.cuttingGraphLimit);


    let data = {
        comments: "GraphTest", nodes, edges
    };

    console.log("data", data);
    return data;
}

function loadGraph(data)
{
    graph = new G6.Graph({
        container: 'canvasContainer', // String | HTMLElement, required, the id of DOM element or an HTML node
        width: 1000, // Number, required, the width of the graph
        height: 600, // Number, required, the height of the graph,
        //fitView: true,
        //fitViewPadding: [20, 40, 50, 20],
        layout: {                // Object, layout configuration. random by default
            type: 'force',         // Force layout
            preventOverlap: true,  // Prevent node overlappings
            linkDistance: 300,
            },
        defaultNode:
            {
                type: 'circle',
                color: '#5366d6',
                size: [50],
                labelCfg: {
                    style: {
                        fill: '#000000',
                        fontSize: 20,
                    }
                }
            },
        defaultEdge:
            {
                type: 'quadratic',
                style: {
                    endArrow: true,
                    startArrow: false,
                    lineWidth: 4
                }
            },
        modes: {
            default: ['drag-canvas', 'zoom-canvas', 'drag-node'], // Allow users to drag canvas, zoom canvas, and drag nodes
        },
    });

    graph.data(data); // Load the data defined in Step 2
    graph.render(); // Render the graph
}