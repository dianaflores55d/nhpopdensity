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
var width = 1000,
    height = 800;

//This is the Color button, on click it calls the Color() funtion
document.write('<button id="Color" class="ColorButton" onclick="Color();">Color</button>');

//This is the Toggle County Boundary button, on click it calls the Boundary() funtion
document.write('<button id="Boundary" class="BoundaryButton" onclick="Boundary();">Toggle County Boundary</button>');

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
var div = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

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


/* Defines path
Defines path generator using Albers projection. This translates our
TopoJSON coordinates into SVG path codes */ 
var path = d3.geoPath()
    .projection(d3.geoAlbers()); 

/* Shows GeoMap & Legend
When json() is called outside of this map function, json data is loaded in & passed
on to map */
function map(json) {
    
    // Defines legend
    var legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(0, 40)");

    /* Assigns colors in color scheme to a range specified in the domain. Ex: 
    the lightest blue is assigned to the range of numbers in [0,1] */ 
    legend.selectAll("rect")
    .data(color.range().map(function(d) {
        d = color.invertExtent(d);
        if (d[0] == null) d[0] = x.domain()[0];
        if (d[1] == null) d[1] = x.domain()[1];
        return d;
    }))
    // Adds colors to legend
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
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    .text("Population per square mile");

    // Adds ticks & tick labels to legend 
    legend.call(d3.axisBottom(x)
        .tickSize(13) 
        .tickValues(color.domain())) 
    .select(".domain")
        .remove();

    /* Passes on county densities to color fcn & colors counties.
    topojson.feature() - converts TopoJSON objects to GeoJSON objects
    features - property of GeoJSON object */
    svg.append("g")
        .selectAll("path")
        .data(topojson.feature(json, json.objects.counties).features)
        .enter().append("path")
            .attr("fill", function(d) { return color(d.properties.DENSITY); })
            .attr("d", path);

    // Draws county shapes & county lines
    svg.append("path")
        .datum(topojson.feature(json, json.objects.counties))   // if I add .features to this & click the Toggle County Boundary button twice, the boundaries disappear (as wanted), but then I can't get them to come back
        .attr("fill", "none")
        .attr("stroke", "#000")
        .attr("stroke-opacity", toggle)
        .attr("d", path);

    // Binds county name to each county on map
    svg.selectAll(".county")
        .data(topojson.feature(json, json.objects.counties).features)
        .enter().append("path")
        .attr("class", function(d) { return "county: " + d.properties.NAME; })
        .attr("d", path)
        .attr("fill", "transparent")

        // Tooltip appears when you hover over a county
        .on("mouseover", function(d){ 
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                // Displays county name & population density on tooltip
                div.html("County: " + d.properties.NAME + "<br/>" + "Population: " + d.properties.DENSITY )
                    .style("left", (d3.event.pageX) + 25 + "px")
                    .style("top", (d3.event.pageY - 30) + "px"); 
        })
        // Tooltip disappears when you stop hovering over a county
        .on("mouseout", function(d) { 
            div.transition()
                .duration(500)
                .style("opacity", 0.0);
        });
}

/* Clicking on button will toggle b/w 2 different color variations of GeoMap
& legend */
function Color() {
    if (color == color1) {
        color = color2;
    } else {
        color = color1;
    }
    d3.json("nh-counties.json").then(map);
}

/* Clicking on button will toggle b/w visible or non-visible county boundaries
in GeoMap */
function Boundary() {
    //console.log("before clicking button: " + toggle);
    if (toggle == 1) {
        toggle = 0;
    } else {
        toggle = 1;
    }
    //console.log("after clicking button: " + toggle);
    d3.json("nh-counties.json").then(map);
}

// Shows GeoMap w/ default settings (orange/ red color & visible county boundaries)
d3.json("nh-counties.json").then(map);
