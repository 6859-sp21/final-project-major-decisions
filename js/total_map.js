function generateMapTotal(){  
    // Size ?
    const width = 960
    const height = 650

    // The svg
    const svg = d3v4.select("#vis")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("id", "total_map")
      .attr('class', 'three-step');

    const projection = d3.geoAlbersUsa()
    .translate([width/2,height/2])
    .scale(1000);

    var path = d3.geoPath().projection(projection);

    const airports = d3v4.csv("https://raw.githubusercontent.com/6859-sp21/final-project-major-decisions/main/data/airlines_agg.csv", function(data_airports) {
    // Load external data and boot
    d3v4.json("https://raw.githubusercontent.com/6859-sp21/final-project-major-decisions/main/data/us.json", function(data){
  
        // Draw the map
        svg.append("g")
            .attr("class", "states")
            .selectAll("path")
            .data(topojson.feature(data, data.objects.states).features)
            .enter()
            .append("path")
              .attr("fill", "#b8b8b8")
              .attr("d", path)
            .style("stroke", "black")
            .style("opacity", .3)
        

        // create a tooltip
        var Tooltip = d3v4.select("#vis")
          .append("div")
          .attr('class', 'tooltip')
          .attr("id", "total_tooltip")
          .style("opacity", 0)
  
        // Three function that change the tooltip when user hover / move / leave a cell
        var mouseover = function(d) {
          Tooltip.style("opacity", 1)
        }
        var mousemove = function(d) {
          Tooltip
            .html(d.airport_name + "<br>" + "Total arriving flights: " + d.arr_flights)
            .style("left", (d3v4.mouse(this)[0]+10) + "px")
            .style("top", (d3v4.mouse(this)[1]) + "px")
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
            .attr("transform", function(d) {
                return "translate("+projection([d.long, d.lat])+")";
            })
            .attr("r", function(d){ return d['arr_flights']/25000})
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
  
  