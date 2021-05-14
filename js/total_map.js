function generateMapTotal(){  
    // Size ?
    const width = 960
    const height = 650

    const territoryPos = new Map(); // a map keeping track if a territory is selected 
    territoryPos.set('BQN', 200);
    territoryPos.set('GUM', 210)
    territoryPos.set('PPG', 220);    
    territoryPos.set('PSE', 230)
    territoryPos.set('SJU', 240)
    territoryPos.set('STT', 250) 
    territoryPos.set('STX', 260) 



    var size = d3.scaleSqrt()
      .domain([1, 2000000])  // What's in the data, let's say it is percentage
      .range([1, 50])  // Size in pixel

    var valuesToShow = [10000, 100000, 1000000]
    var xCircle = 550
    var xLabel = 600
    var yCircle = 580

    const projection = d3.geoAlbersUsa()
    .translate([width/2,height/2])
    .scale(1000);

    var path = d3.geoPath().projection(projection);

    const airports = d3v4.csv("https://raw.githubusercontent.com/6859-sp21/final-project-major-decisions/main/data/airlines_agg.csv", function(data_airports) {
    const sortedData = data_airports.sort(function(x, y){
      return d3.descending(+x.arr_flights, +y.arr_flights);
    })
    
    // Load external data and boot
    d3v4.json("https://raw.githubusercontent.com/6859-sp21/final-project-major-decisions/main/data/us.json", function(data){
  
            // The svg
        const svg = d3.select("#vis")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .on("click", reset)
        .attr("id", "total_map")
        .attr('class', 'three-step');

        const g = svg.append("g");

        // Draw the map
        const states=g.append("g")
            .attr("fill", "#E5E7E9")
            .attr("cursor", "pointer")
            .selectAll("path")
            .data(topojson.feature(data, data.objects.states).features)
            .join("path")
              .on("click", clicked)
              .attr("d", path);
            
        g.append("path")
            .attr("fill", "none")
            .style("stroke", "black")
            .style("opacity", .3)
            .attr("d", path(topojson.mesh(data, data.objects.states, (a, b) => a !== b)));

        

        // create a tooltip
        var Tooltip = d3.select("#vis")
          .append("div")
          .attr('class', 'tooltip')
          .attr("id", "total_tooltip")
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
            .attr("r", function(d){ return size(d['arr_flights'])})
            .attr("class", "circle")
            .style("fill", "#e5c494")
            .attr("stroke", "#e5c494")
            .attr("stroke-width", 2)
            .attr("fill-opacity", .4)
          .on("mouseover", (event, d) => {
            Tooltip.style("opacity", 1)
          })
          .on("mousemove", (event, d) => {
            Tooltip
              .html(d.airport_name + "<br>" + "Total arriving flights: " + d.arr_flights)
              .style("left", (d3.pointer(event, states.node())[0]+10) + "px")
              .style("top", (d3.pointer(event, states.node())[1]) + "px")
          })
          .on("mouseleave", (event, d) => {
            Tooltip.style("opacity", 0)
          })

      
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
          .attr("class", "legend")
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

        // var zoom = d3.zoom()
        // .scaleExtent([1, 8])
        // .on('zoom', function(event) {
        //     svg.selectAll('path')
        //     .attr('transform', event.transform);
        //     svg.selectAll('circle')
        //     .attr('transform', event.transform);
        //     svg.selectAll('line')
        //     .attr('transform', event.transform);
        //     svg.selectAll('text')
        //     .attr('transform', event.transform);
        //     svg.selectAll('rect')
        //     .attr('transform', event.transform);
        //     svg.selectAll('div')
        //     .attr('transform', event.transform);
        // });

        //////////////////////////////////////////////

        const zoom = d3.zoom()
          .scaleExtent([1, 8])
          .on("zoom", zoomed);

        // function zoomed({transform}) {
        //   svg.select('.states').attr("transform", transform);
        //   svg.selectAll('circle').attr('transform', transform);
        //   svg.selectAll('line').attr('transform', transform);
        //   svg.selectAll('text').attr('transform', transform);
        //   svg.selectAll('rect').attr('transform', transform);
        //   svg.selectAll('div').attr('transform', transform);
        // }

        svg.call(zoom);

        // var sliderSimple = d3
        // .sliderBottom()
        // .width(300)
        // .min(1)
        // .max(8)
        // .default(1)
        // .ticks(0)
        // .on('onchange', val => {
        //   svg.transition().call(zoom.scaleBy, val)
        // });
    
        // let gSimple = svg.append('svg')
        // .attr('x',30).attr('y', 800)
        // .attr("viewBox", [0, 0, width+width/10, height]) // changes here 
        // .style('width', width+width/10)
        // .style('height', height)
        // .append('g')
        // .attr('transform', 'translate(30,30)');
      
        // gSimple.call(sliderSimple);

        function reset() {
          states.transition().style("fill", null);
          svg.transition().duration(750).call(
            zoom.transform,
            d3.zoomIdentity,
            d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
          );
        }
      
        function clicked(event, d) {
          const [[x0, y0], [x1, y1]] = path.bounds(d);
          event.stopPropagation();
          states.transition().style("fill", null);
          d3.select(this).transition().style("fill", "DarkGrey");
          svg.transition().duration(750).call(
            zoom.transform,
            d3.zoomIdentity
              .translate(width / 2, height / 2)
              .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
              .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
            d3.pointer(event, svg.node())
          );
        }
      
        function zoomed(event) {
          const {transform} = event;
          g.attr("transform", transform);
          g.attr("stroke-width", 1 / transform.k);

          svg.selectAll('circle').attr('transform', transform);
          svg.selectAll('line').attr('transform', transform);
          svg.selectAll('text').attr('transform', transform);
          svg.selectAll('rect').attr('transform', transform);
          svg.selectAll('div').attr('transform', transform);
        }
      });
    })
  }
  
  