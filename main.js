// set the dimensions and margins of the graph
const margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = 450 - margin.left - margin.right,
    height = 480 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#my_dataviz").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Color scale used
const color = d3.scaleOrdinal(d3.schemeCategory20);

// Set the sankey diagram properties
const sankey = d3.sankey()
    .nodeWidth(36)
    .nodePadding(290)
    .size([width, height]);

// load the data
d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_sankey.json", function(error, graph) {

    // Constructs a new Sankey generator with the default settings.
    sankey
        .nodes(graph.nodes)
        .links(graph.links)
        .layout(1);

    // add in the links
    const link = svg.append("g")
        .selectAll(".link")
        .data(graph.links)
        .enter()
        .append("path")
        // .attr("class", "link")
        // make the fill a gradient from source to target color
        // .style("stroke", function(d) {
        //     const sourceColor = color(d.source.name.replace(/ .*/, ""));
        //     const targetColor = color(d.target.name.replace(/ .*/, ""));
        //
        //     // make a gradient from source to target color
        //     const gradient = svg.append("defs")
        //         .append("linearGradient")
        //         .attr("id", "gradient")
        //         .attr("x1", "0%")
        //         .attr("y1", "0%")
        //         .attr("x2", "100%")
        //         .attr("y2", "0%");
        //     gradient.append("stop")
        //         .attr("offset", "0%")
        //         .attr("stop-color", sourceColor);
        //     gradient.append("stop")
        //         .attr("offset", "100%")
        //         .attr("stop-color", targetColor);
        //
        //     return "url(#gradient)";
        // })
        .attr("d", sankey.link() )
        .style("stroke-width", function(d) { return Math.max(1, d.dy); })
        .sort(function(a, b) { return b.dy - a.dy; });

    link.append("linearGradient")
        .attr("id", function(d) { return "link-gradient-" + d.source.name.replace(/ .*/, "") + "-" + d.target.name.replace(/ .*/, ""); })
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", d => d.source.x1)
        .attr("x2", d => d.target.x0)
        .call(gradient => gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", function(d) { return color(d.source.name.replace(/ .*/, "")); }))
        .call(gradient => gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color" , function(d) { return color(d.target.name.replace(/ .*/, "")); }));

    link.append("path")
        .attr("d", sankey.link())
        .attr("stroke", function(d) { return "url(#link-gradient-" + d.source.name.replace(/ .*/, "") + "-" + d.target.name.replace(/ .*/, "") + ")"; })
        .attr("stroke-width", ({width}) => Math.max(1, width))


    // add in the nodes
    const node = svg.append("g")
        .selectAll(".node")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
        .call(d3.drag()
            .subject(function(d) { return d; })
            .on("start", function() { this.parentNode.appendChild(this); })
            .on("drag", dragmove));

    // add the rectangles for the nodes
    node
        .append("rect")
        .attr("height", function(d) { return d.dy; })
        .attr("width", sankey.nodeWidth())
        .style("fill", function(d) { return d.color = color(d.name.replace(/ .*/, "")); })
        .style("stroke", function(d) { return d3.rgb(d.color).darker(2); })
        // Add hover text
        .append("title")
        .text(function(d) { return d.name + "\n" + "There is " + d.value + " stuff in this node"; });

    // add in the title for the nodes
    node
        .append("text")
        .attr("x", -6)
        .attr("y", function(d) { return d.dy / 2; })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text(function(d) { return d.name; })
        .filter(function(d) { return d.x < width / 2; })
        .attr("x", 6 + sankey.nodeWidth())
        .attr("text-anchor", "start");

    // the function for moving the nodes
    function dragmove(d) {
        d3.select(this)
            .attr("transform",
                "translate("
                + d.x + ","
                + (d.y = Math.max(
                        0, Math.min(height - d.dy, d3.event.y))
                ) + ")");
        sankey.relayout();
        link.attr("d", sankey.link() );
    }

});
