const attributeMap = new Map(); // a map keeping track if a genre is selected 
attributeMap.set('arr_del15', 'Total Delayed Flights: ');
attributeMap.set('carrier_ct', 'Carrier Delayed Flights: ')
attributeMap.set('weather_ct', 'Weather Delayed Flights: ');    
attributeMap.set('nas_ct', 'National Air System Delayed Flights: ')
attributeMap.set('security_ct', 'Security Delayed Flights: ')
attributeMap.set('late_aircraft_ct', 'Late Aircraft Delayed Flights: ')    


function choose(choice){
    d3.select("#delay_map").remove();
    d3.select("#delay_tooltip").remove();
    generateMap(choice)
}

function generateMap(selectedAttribute){  
    // Size ?
    const width = 960
    const height = 650
    d3.select("#delay_map").remove();
    d3.select("#delay_tooltip").remove();
    
  
    // The svg
    const svg = d3.select("#vis")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("id", "delay_map")
      .attr('class', 'four-step');


    const projection = d3.geoAlbersUsa()
    .translate([width/2,height/2])
    .scale(1000);

    var path = d3.geoPath().projection(projection);
  
    const airports = d3v4.csv("https://raw.githubusercontent.com/6859-sp21/final-project-major-decisions/main/data/airlines_agg.csv", function(data_airports) {
    // Load external data and boot
    d3v4.json("https://raw.githubusercontent.com/6859-sp21/final-project-major-decisions/main/data/us.json", function(data){
  
        // Draw the map
        const g=svg.append("g")
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
          .attr("class", "tooltip")
          .attr("id", "delay_tooltip")
          .style("opacity", 0)
  
        // Add circles:
        var circles= svg
          .selectAll("myCircles")
          .data(data_airports)
          .enter()
          .append("circle")
            .attr("transform", function(d) {
              return "translate("+projection([d.long, d.lat])+")";
            })
            .attr("r", function(d){ return d[selectedAttribute]/5000})
            .attr("class", "circle")
            .style("fill", "#69b3a2")
            .attr("stroke", "#69b3a2")
            .attr("stroke-width", 3)
            .attr("fill-opacity", .4)
          .on("mouseover", (event, d) => {
            Tooltip.style("opacity", 1)
          })
          .on("mousemove", (event, d) => {
            Tooltip
            .html(d.airport_name + "<br>" + attributeMap.get(selectedAttribute) + d.arr_flights)
              .style("left", (d3.pointer(event, g.node())[0]+10) + "px")
              .style("top", (d3.pointer(event, g.node())[1]) + "px")
          })
          .on("mouseleave", (event, d) => {
            Tooltip.style("opacity", 0)
          })
        });
    })
  }
