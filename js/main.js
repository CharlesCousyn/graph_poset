let fileJSON;
let loadedConfig;
let graph;

let GENERAL_CONFIG =
    {
        cuttingGraphLimit: 100000,
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
                            loadedConfig = fileJSON.find(activityResult => activityResult._activityName === selectActivity.options[selectActivity.selectedIndex].value);

                            console.log("loadedConfig", loadedConfig);
                            loadGraph(graphAdjListToGraphJSON(loadedConfig));
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
    let optionsHTMLActivity= ["<option value='' selected disabled hidden>Choose activity</option>", ...fileJson.map(obj => `<option${name === 0 ? " selected" : ""} value='${obj._activityName}'> ${obj._activityName}</option>`)];
    selectActivity.innerHTML = optionsHTMLActivity.join("");
}

function numPOSETtoGraphJSON(activityRes)
{
    let nodes = activityRes._numPOSET._elementsIds.map((id, index) =>
    {
        return {id: id, label: id, index: index};
    });


    let edges = activityRes._numPOSET._matrix.flatMap((line, indexLine, arr) =>
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

    console.log("nodes", nodes);
    console.log("edges", edges);

    //Cut the graph, limit the number of nodes
    nodes = nodes.filter(node => node.index < GENERAL_CONFIG.cuttingGraphLimit);
    edges = edges.filter(edge => edge.indexSource < GENERAL_CONFIG.cuttingGraphLimit && edge.indexTarget < GENERAL_CONFIG.cuttingGraphLimit);


    let data = {
        comments: "GraphTest", nodes, edges
    };

    console.log("data", data);
    return data;
}

function graphAdjListToGraphJSON(activityRes)
{
    let nodes = activityRes._graphAdjList._adjList.map(([idNode, map], index) => ({id: idNode, label: idNode, index: index}));

    let edges = activityRes._graphAdjList._adjList.flatMap(([idNode, map], index, arr) =>
    {
        let from = idNode;

        return map.map(([idNode1, weight], index1) =>
        {
            let weightEdge = 0;
            let to = idNode1;

            if(GENERAL_CONFIG.substractingEdges)
            {
                let symValue = 0;
                let [idNode2, map2] = arr.find(el => el[0] === to);

                if([idNode2, map2]  !== undefined)
                {
                    let [idNode3, weightFound] = map2.find(el => el[0] === from);
                    if([idNode3, weightFound]  !== undefined)
                    {
                        symValue = weightFound;
                    }
                }
                weightEdge = weight - symValue;
            }
            else
            {
                weightEdge = weight;
            }

            //Choosing if there's an edge or not
            if(weightEdge > 0 && weightEdge !== null)
            {
                return {
                    source: from,
                    target: to,
                    label: weightEdge,
                    relatedness: weightEdge,
                    indexSource: index,
                    indexTarget: index1,
                    style: {
                        endArrow: true,
                        startArrow: false,
                        lineWidth: 3 + weightEdge * 0.75,
                        opacity: 0.6
                    }
                };
            }
        });

    });

    console.log("nodes", nodes);
    console.log("edges", edges);

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
    if(graph === undefined)
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
    }

    graph.data(data); // Load the data defined in Step 2
    graph.render(); // Render the graph
}