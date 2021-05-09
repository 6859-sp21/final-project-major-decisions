const attributeMap = new Map(); // a map keeping track if a attribute is selected 
attributeMap.set('arr_del15', 'Total Delayed Flights: ');
attributeMap.set('carrier_ct', 'Carrier Delayed Flights: ')
attributeMap.set(' weather_ct', 'Weather Delayed Flights: ');    
attributeMap.set('nas_ct', 'National Air System Delayed Flights: ')
attributeMap.set('security_ct', 'Security Delayed Flights: ')
attributeMap.set('late_aircraft_ct', 'Late Aircraft Delayed Flights: ')    

const territoryPos = new Map(); // a map keeping track if a territory is selected 
territoryPos.set('BQN', 200);
territoryPos.set('GUM', 210)
territoryPos.set('PPG', 220);    
territoryPos.set('PSE', 230)
territoryPos.set('SJU', 240)
territoryPos.set('STT', 250) 
territoryPos.set('STX', 260) 

const colors = new Map(); // a map keeping track if a attribute is selected 
colors.set('arr_del15', '#ebc334');
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

    var size = d3.scaleSqrt()
      .domain([1, 260000])  // What's in the data, let's say it is percentage
      .range([1, 50])  // Size in pixel

    var valuesToShow = [1000, 10000, 100000]
    var xCircle = 550
    var xLabel = 600
    var yCircle = 580


    const projection = d3.geoAlbersUsa()
    .translate([width/2,height/2])
    .scale(1000);

    var path = d3.geoPath().projection(projection);
  
    const airports = d3v4.csv("https://raw.githubusercontent.com/6859-sp21/final-project-major-decisions/main/data/airlines_agg.csv", function(data_airports) {
    // Load external data and boot
    const sortedData = data_airports.sort(function(x, y){
      return d3.descending(+x[selectedAttribute], +y[selectedAttribute]);
    })
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
          .data(sortedData)
          .enter()
          .append("circle")
            .attr("cx", function(d) {
              if (projection([d.long, d.lat])==null){
                return territoryPos.get(d.airport);
              }
              else {
                return projection([d.long, d.lat])[0];
              }
            })
            .attr("cy", function(d) {
              if (projection([d.long, d.lat])==null){
                return 560;
              }
              else {
                return projection([d.long, d.lat])[1];
              }
            })
            .attr("r", function(d){ return size(d[selectedAttribute])})
            .attr("class", "circle")
            .style("fill", colors.get(selectedAttribute))
            .attr("stroke", colors.get(selectedAttribute))
            .attr("stroke-width", 2)
            .attr("fill-opacity", .4)
          .on("mouseover", (event, d) => {
            Tooltip.style("opacity", 1)
          })
          .on("mousemove", (event, d) => {
            Tooltip
            .html(d.airport_name + "<br>" + attributeMap.get(selectedAttribute) + Math.round(d[selectedAttribute]))
              .style("left", (d3.pointer(event, g.node())[0]+10) + "px")
              .style("top", (d3.pointer(event, g.node())[1]) + "px")
          })
          .on("mouseleave", (event, d) => {
            Tooltip.style("opacity", 0)
          })
        });

        svg
          .selectAll("legend")
          .data(valuesToShow)
          .enter()
          .append("circle")
            .attr("cx", xCircle)
            .attr("cy", function(d){ return yCircle - size(d) } )
            .attr("r", function(d){ return size(d) })
            .style("fill", "none")
            .attr("stroke", "black")
        svg
          .selectAll("legend")
          .data(valuesToShow)
          .enter()
          .append("line")
            .attr('x1', function(d){ return xCircle } )
            .attr('x2', xLabel)
            .attr('y1', function(d){ return yCircle - 2*size(d) } )
            .attr('y2', function(d){ return yCircle - 2*size(d) } )
            .attr('stroke', 'black')
            .style('stroke-dasharray', ('2,2'))

        svg
          .selectAll("legend")
          .data(valuesToShow)
          .enter()
          .append("text")
            .attr('x', xLabel)
            .attr('y', function(d){ return yCircle - 2*size(d) } )
            .text( function(d){ return d+" flights" } )
            .style("font-size", 10)
            .attr('alignment-baseline', 'middle')
        
        var zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on('zoom', function(event) {
            svg.selectAll('path')
            .attr('transform', event.transform);
            svg.selectAll('circle')
            .attr('transform', event.transform);
            svg.selectAll('line')
            .attr('transform', event.transform);
            svg.selectAll('text')
            .attr('transform', event.transform);
            svg.selectAll('rect')
            .attr('transform', event.transform);
            svg.selectAll('div')
            .attr('transform', event.transform);
        });

        svg.call(zoom);
    })
  }
