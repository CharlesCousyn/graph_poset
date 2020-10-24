let fileJSON;
let loadedConfig;
let myChart;

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
    console.log(fileJson)
    //Update select criterion to sort
    const selectActivity = document.getElementById("selectActivity");
    let optionsHTMLActivity= ["<option value='' selected disabled hidden>Choose activity</option>", ...fileJson.map(obj => `<option${name === 0 ? " selected" : ""} value='${obj.activityName}'> ${obj.activityName}</option>`)];
    selectActivity.innerHTML = optionsHTMLActivity.join("");
}

function numPOSETtoGraphJSON(activityRes)
{
    console.log(activityRes);
    let nodes = activityRes.numPOSET._elementsIds.map((id, index) =>
    {
        return {id: index, caption: id};
    });
    console.log(nodes);

    let edges = activityRes.numPOSET._matrix.map((line, indexLine) =>
        line.map((value, indexCol) =>
        {
            if(value !== 0)
            {
                return {
                    source: indexLine,
                    target: indexCol,
                    caption: value
                };
            }
        }));

    console.log(edges);

    return {
        comments: "GraphTest", nodes, edges: []
    };
}

function loadGraph(data)
{
    let config = {
        dataSource: data,
        forceLocked: false,
        graphHeight: function(){ return 700; },
        graphWidth: function(){ return 700; },
        linkDistance: function(){ return 40; },
        directedEdges: true
    };
    alchemy.begin(config);
}