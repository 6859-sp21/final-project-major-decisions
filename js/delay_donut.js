function generateDonut(){  
    // Size ?
    // set the dimensions and margins of the graph
    const width = 960
    const height = 650

    // The radius of the pieplot is half the width or half the height (smallest one)
    var radius = Math.min(width, height) / 2 - 100


    // The svg
    const svg = d3.select("#vis")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("id", "donut-map")
      .attr('class', 'donut-step')
      .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    const colors = new Map(); // a map keeping track if a attribute is selected 
    colors.set('carrier_ct', '#66c2a5');
    colors.set('weather_ct', '#fc8d62');    
    colors.set('nas_ct', '#a6d854');
    colors.set('security_ct', '#8da0cb');
    colors.set('late_aircraft_ct', '#e78ac3');

    const attributeMap = new Map(); // a map keeping track of attribute names 
      attributeMap.set('carrier_ct', 'Air Carrier')
      attributeMap.set('weather_ct', 'Extreme Weather');    
      attributeMap.set('nas_ct', 'National Aviation System')
      attributeMap.set('security_ct', 'Security')
      attributeMap.set('late_aircraft_ct', 'Late-arriving aircraft')    


    var data = {carrier_ct: 1502836, weather_ct: 174896, nas_ct: 1679107, security_ct: 10583.35, late_aircraft_ct: 1852350.1}

    var pie = d3v4.pie()
    .sort(null) // Do not sort group by size
    .value(function(d) {return d.value; })
  
    var data_ready = pie(d3v4.entries(data))

    // The arc generator
    var arc = d3v4.arc()
      .innerRadius(radius * 0.5)         // This is the size of the donut hole
      .outerRadius(radius * 0.8)

    // Another arc that won't be drawn. Just for labels positioning
    var outerArc = d3v4.arc()
      .innerRadius(radius * 0.9)
      .outerRadius(radius * 0.9)

    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    svg
      .selectAll('allSlices')
      .data(data_ready)
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', function(d){ return(colors.get(d.data.key)) })
      .attr("stroke", "white")
      .style("stroke-width", "2px")
      .style("opacity", 0.7)

    // Add the polylines between chart and labels:
    svg
      .selectAll('allPolylines')
      .data(data_ready)
      .enter()
      .append('polyline')
        .attr("stroke", "black")
        .style("fill", "none")
        .attr("stroke-width", 1)
        .attr('points', function(d) {
          var posA = arc.centroid(d) // line insertion in the slice
          var posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
          var posC = outerArc.centroid(d); // Label position = almost the same as posB
          var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
          posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
          return [posA, posB, posC]
        })

    // Add the polylines between chart and labels:
    svg
      .selectAll('allLabels')
      .data(data_ready)
      .enter()
      .append('text')
        .text( function(d) { console.log(d.data.key) ; return attributeMap.get(d.data.key) } )
        .attr('transform', function(d) {
            var pos = outerArc.centroid(d);
            var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
            pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
            return 'translate(' + pos + ')';
        })
        .style('text-anchor', function(d) {
            var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
            return (midangle < Math.PI ? 'start' : 'end')
        })
          
}
    
  