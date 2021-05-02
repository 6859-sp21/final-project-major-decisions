function choose(choice){
    generateMap(choice)
}

function generateMap(selectedAttribute){
    // Create data for circles:
    d3.select("#delay_map").remove();
    d3.select("#delay_tooltip").remove();
  
    // Size ?
    const width = 960
    const height = 650
  
    // The svg
    const svg = d3.select("#vis")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("id", "delay_map");
  
    // Map and projection
    const projection = d3.geoMercator()
        .center([-100, 50])                // GPS of location to zoom on
        .scale(400)                       // This is like the zoom
        .translate([ width/2, height/2 ])
  
    const airports = d3.csv("https://raw.githubusercontent.com/6859-sp21/final-project-major-decisions/main/data/airlines_agg.csv", function(data_airports) {
    // Load external data and boot
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson", function(data){
  
        // Filter data
        data.features = data.features.filter( function(d){return d.properties.name=="USA"} )
  
        // Draw the map
        svg.append("g")
            .selectAll("path")
            .data(data.features)
            .enter()
            .append("path")
              .attr("fill", "#b8b8b8")
              .attr("d", d3.geoPath()
                  .projection(projection)
              )
            .style("stroke", "black")
            .style("opacity", .3)
  
        // create a tooltip
        var Tooltip = d3.select("#vis")
          .append("div")
          .attr("class", "tooltip")
          .attr("id", "delay_tooltip")
          .style("opacity", 1)
          .style("background-color", "white")
          .style("border", "solid")
          .style("border-width", "2px")
          .style("border-radius", "5px")
          .style("padding", "5px")
  
        // Three function that change the tooltip when user hover / move / leave a cell
        var mouseover = function(d) {
          Tooltip.style("opacity", 1)
        }
        var mousemove = function(d) {
          Tooltip
            .html(d.airport_name + "<br>" + selectedAttribute + ": " + d.arr_flights)
            .style("left", (d3.mouse(this)[0]+10) + "px")
            .style("top", (d3.mouse(this)[1]) + "px")
        }
        var mouseleave = function(d) {
          Tooltip.style("opacity", 0)
        }
  
        // Add circles:
        var circles= svg
          .selectAll("myCircles")
          .data(data_airports)
          .enter()
          .append("circle")
            .attr("cx", function(d){ return projection([d.long, d.lat])[0] })
            .attr("cy", function(d){ return projection([d.long, d.lat])[1] })
            .attr("r", function(d){ return d[selectedAttribute]/5000})
            .attr("class", "circle")
            .style("fill", "#69b3a2")
            .attr("stroke", "#69b3a2")
            .attr("stroke-width", 3)
            .attr("fill-opacity", .4)
          .on("mouseover", mouseover)
          .on("mousemove", mousemove)
          .on("mouseleave", mouseleave)
        });
    })
  }
