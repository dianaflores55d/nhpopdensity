/*----------------------------------------------------------------------------- 
Diana Flores
dgflores
153469
CSE 163
Assignment 7: GeoMapping: Population Density Map
File: geomap.js
Contructs a GeoMap using D3 
-----------------------------------------------------------------------------*/
/* Defines size
Defines the size (width and height) of our SVG element (GeoMap). */
var width = 900,
    height = 800;

/* Defines SVG
Creates SVG element (in which to place our visuals) with margin & size
properties defined earlier. Creates g element within SVG elem; SVG 
elems within this g element will be grouped together. */
var svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g");

// Defines tooltip
var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

/* Defines pop
Defines pop as object that will store data from our CSV file */
var pop = {
    stateName: {},
    countyNames: {},
    densities: {}
};

/* Data Quantization: Defines 2 color variations for GeoMap
Groups range of numbers in between 0-1, 1-10, and so on. Each group is mapped
to a specific color in the OrRd or GrBl color scheme (depending on the variation)
*/
var color1 = d3.scaleThreshold()
    .domain([1, 10, 50, 200, 500, 1000, 2000, 4000])
    .range(d3.schemeOrRd[9]);

var color2 = d3.scaleThreshold()
    .domain([1, 10, 50, 200, 500, 1000, 2000, 4000])
    .range(d3.schemeBlues[9]);

// Defines variables for color & boundary buttons
var color = color1,
    toggle = 1;

// Normalization for Pop Density: Defines color legend's scale
var x = d3.scaleSqrt()
    .domain([0, 4500])
    .rangeRound([440, 950]);

// Defines legend
var legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(0, 40)");

// Calculates domain and range we'll use for legend & map
legend.selectAll("rect")
    .data(color.range().map(function(d) {
        d = color.invertExtent(d);
        if (d[0] == null) d[0] = x.domain()[0];
        if (d[1] == null) d[1] = x.domain()[1];
        return d;
    }))
    .enter().append("rect")
        .attr("height", 8)
        .attr("x", function(d) { return x(d[0]); })
        .attr("width", function(d) { return x(d[1]) - x(d[0]); })
        .attr("fill", function(d) { return color(d[0]); });

// Adds label to legend
legend.append("text")
    .attr("class", "label")
    .attr("x", x.range()[0])
    .attr("y", -6)
    .attr("fill", "#000")
    .attr("text-anchor", "start")
    .attr("font-weight", "bold")
    .text("Population per square mile");

// Adds ticks to legend 
legend.call(d3.axisBottom(x)
        .tickSize(13) 
        .tickValues(color.domain())) 
    .select(".domain")
        .remove();

/* Defines path
Defines path generator using Albers projection. This translates our
TopoJSON coordinates into SVG path codes */ 
var path = d3.geoPath()
    .projection(d3.geoAlbers()); 

/* Calls csv() and defines callback function
Loads in data from url (file name of our CSV file). After loading in data, 
calls callback() defined below */
d3.csv("nh-pop-density.csv", function(d) {
    pop.stateName[d["County code"]] = d["State"];
    pop.countyNames[d["County code"]] = d["County name"];
    pop.densities[d["County code"]] = +d["Density per square mile of land area"];

    /* Calls json() and defines callback function
    Loads in data from url (file name of our JSON file). After loading in data, 
    calls callback() defined below */
    d3.json("nh-counties.json").then(function(json) {

        /* Passes on county densities to color fcn & colors counties.
        topojson.feature() - converts TopoJSON objects to GeoJSON objects
        features - property of GeoJSON object */
        svg.append("g")
            .selectAll("path")
            .data(topojson.feature(json, json.objects.counties).features)
            .enter().append("path")
                .attr("fill", function(d) { return color(pop.densities[d.id]); })
                .attr("d", path);

        // Draws county shapes & county lines
        svg.append("path")
            .datum(topojson.feature(json, json.objects.counties))
            .attr("fill", "none")
            .attr("stroke", "#000")
            .attr("stroke-opacity", toggle)
            .attr("d", path);
    });
});