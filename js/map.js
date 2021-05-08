const attributeMap = new Map(); // a map keeping track if a genre is selected 
attributeMap.set('arr_del15', 'Total Delayed Flights: ');
attributeMap.set('carrier_ct', 'Carrier Delayed Flights: ')
attributeMap.set(' weather_ct', 'Weather Delayed Flights: ');    
attributeMap.set('nas_ct', 'National Air System Delayed Flights: ')
attributeMap.set('security_ct', 'Security Delayed Flights: ')
attributeMap.set('late_aircraft_ct', 'Late Aircraft Delayed Flights: ')    

const territoryPos = new Map(); // a map keeping track if a genre is selected 
territoryPos.set('BQN', 'translate(200 560)');
territoryPos.set('GUM', 'translate(210 560)')
territoryPos.set('PPG', 'translate(220 560)');    
territoryPos.set('PSE', 'translate(230 560)')
territoryPos.set('SJU', 'translate(240 560)')
territoryPos.set('STT', 'translate(250 560)') 
territoryPos.set('STX', 'translate(260 560)') 

const colors = new Map(); // a map keeping track if a genre is selected 
colors.set('arr_del15', '#ffd92f');
colors.set('carrier_ct', '#66c2a5')
colors.set(' weather_ct', '#fc8d62');    
colors.set('nas_ct', '#8da0cb')
colors.set('security_ct', '#e78ac3')
colors.set('late_aircraft_ct', '#a6d854')    


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
        var Tooltip = d3.select("#vis")
          .append("div")
          .attr("class", "tooltip")
          .attr("id", "delay_tooltip")
          .style("opacity", 0)

        svg.append('rect')
          .attr('x', 190)
          .attr('y', 550)
          .attr('width', 80)
          .attr('height', 20)
          .attr('fill', 'white')
          .attr('stroke', 'DarkGrey');
  
        // Add circles:
        var circles= svg
          .selectAll("myCircles")
          .data(data_airports)
          .enter()
          .append("circle")
            .attr("transform", function(d) {
              if (projection([d.long, d.lat])==null){
                return territoryPos.get(d.airport);
              }
              else {
                return "translate("+projection([d.long, d.lat])+")";
              }
            })
            .attr("r", function(d){ return d[selectedAttribute]/5000})
            .attr("class", "circle")
            .style("fill", colors.get(selectedAttribute))
            .attr("stroke", colors.get(selectedAttribute))
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
