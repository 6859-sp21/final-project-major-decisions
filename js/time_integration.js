function createTimeChart() {
  d3.csv("https://raw.githubusercontent.com/6859-sp21/final-project-major-decisions/main/data/airlines_time_agg.csv", function (d) {
    return {
      date: new Date(+d.year, +d.month),
      carrier: d.carrier,
      carrier_name: d.carrier_name,
      arr_flights: +d.arr_flights,
      carrier_ct: (+d.carrier_ct * 10000) / +d.arr_flights,
      weather_ct: (+d.weather_ct * 10000) / +d.arr_flights,
      nas_ct: (+d.nas_ct * 10000) / +d.arr_flights,
      security_ct: (+d.security_ct * 10000) / +d.arr_flights,
      late_aircraft_ct: (+d.late_aircraft_ct * 10000) / +d.arr_flights,
    };
  }).then(function (data) {
    let airData = data;
    generateTimeChart(airData);
  });
}

function generateTimeChart(data) {
  let sortedData = data.sort((x, y) => d3.ascending(x.date, y.date));

  // need to set up
  let aggData = sortedData.filter((d) => d.carrier === "AS");
  let selectedCarrier = "Alaska Airlines Inc.";

  let airlineCarriers = new Set(data.map((d) => d.carrier_name));

  // add the options to the button
  let airlineSelection = d3.select("#selectButton")
    .selectAll("myOptions")
    .data(airlineCarriers)
    .enter()
    .append("option")
    .text((d) => d)
    .attr("value", (d) => d);

  // set the dimensions and margins of the graph
    let fullWidth = 560,
        fullHeight = 500;

    let margin  = {top: 20, right: 30, bottom: 30, left: 60},
      width = fullWidth - margin.left - margin.right,
      height  = fullHeight - margin.top - margin.bottom;

  let previewHeight = 125;
  let legendSize = 20;

  // append the svg object to the body of the page
  const svg = d3.select("#vis")
    .append("svg")
    .attr("class", "five-step")
    .attr("id", "time_vis")
    .attr("width", width + 5*margin.left) // 800
    .attr("height", height + 2*previewHeight)
    .append("g")
      .attr(
        "transform",
        `translate(${margin.left},${margin.bottom})`
      );

  // document.getElementById("vis").appendChild(svg.node());
  // for some reason, using this doesn't actually add it to the DOM?
  // also, lining up axes and areas keeps going outside bounds without append("g") and translate

  // ----- DEFINE STACKED DATA ----- //
  let delayTypes = [
    "carrier_ct",
    "weather_ct",
    "nas_ct",
    "security_ct",
    "late_aircraft_ct",
  ];

  let stackGen = d3.stack().keys(delayTypes);
  let stackedData = stackGen(aggData);

  // var to save state: in all-delays view or individual delay type view?
  let individualView = false;
  let currentData = stackedData;


  // ----- AXES SCALES AND LABELS ----- //
  let x = d3
    .scaleTime()
    .domain(d3.extent([new Date(2015,12), d3.max(sortedData, d => d.date)]))
    .range([0, width])

  let xAxis = d3.axisBottom(x);
  let xAxisGroup = svg
    .append("g")
    .call(xAxis)
    .attr("transform", `translate(0,${height})`)
    // .selectAll("text")
      // .attr("transform", "translate(-10,5)rotate(-30)");
  
  xAxisGroup.selectAll(".tick").each(function(d) {
    if (this.textContent === d3.timeFormat("%B")(d)) {
      d3.select(this).select("text").text(d3.timeFormat("%b"))
    }
  })

  let xAxisLabel = svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", width/2 + margin.right)
    .attr("y", height + 2*margin.top)
    .text("Date")

  let y = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(sortedData, function (d) {
        return (
          d.carrier_ct +
          d.weather_ct +
          d.nas_ct +
          d.security_ct +
          d.late_aircraft_ct
        );
      }),
    ])
    .range([height, 0])
    .nice();

  let yAxis = d3.axisLeft(y);
  let yAxisGroup = svg
    .append("g")
    .call(yAxis)

  let yAxisLabel = svg.append("text")
    .attr("x", -height*3/4)
    .attr("y", -50)
    .text("No. of Delays per 10,000 Arriving Flights")
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "start")


  // ----- COLOR ENCODING ----- //
  const delayColors = ["#CFEBDE","#FFD7BB","#e6f5c9","#cbd5e8","#F5E3EE"];
  const highlightColors = ["#82D9B2","#FFB480","#C3E189","#ACC0E5","#E9BDD8"];
  const legendColors = ["#E7F6F0", "#FFEFE4", "#EBF3DD", "#E7EBF1", "#F6ECF2"];

  const color = d3.scaleOrdinal().domain(delayTypes).range(delayColors);
  const highlightColor = d3.scaleOrdinal().domain(delayTypes).range(highlightColors);
  const legendColor = d3.scaleOrdinal().domain(delayTypes).range(legendColors);


  // https://stackoverflow.com/questions/38670322/d3-brushing-and-mouse-move-coexist 
  
  
  // ----- CONTEXT VIEW AXES AND SCALES ----- //
  let xContext = d3
    .scaleTime()
    .domain(d3.extent(sortedData, (d) => d.date))
    .range([0, width])

  let xContextAxis = d3.axisBottom(x);
  let xContextAxisGroup = svg
    .append("g")
    .call(xContextAxis)
    .attr("transform", `translate(0,${height + previewHeight + 1.5*margin.bottom})`);

  let yContext = d3
    .scaleLinear()
    .range([previewHeight, 0])
    .domain(y.domain())


  // ----- ADD CONTEXT COMPONENTS ----- //
  let context = svg.append("g")
    .attr("class", "context")
    .attr("transform", `translate(0,${height + 1.5*margin.bottom})`)

  let areaContext = d3
    .area()
    .x((d) => x(d.data.date))
    .y0((d) => yContext(d[0]))
    .y1((d) => yContext(d[1]));

  function drawContextArea(layerData) {
    context
      .selectAll("contextLayers")
      .data(layerData)
      .join("path")
      .attr("class", function (d) {
          return "contextLayers " + d.key;
      })
      .attr("d", areaContext)
      .attr("fill", "#B2C8EE")
  }

  drawContextArea(stackedData);

  let contextRect = context.append('rect')
    .attr("class", "contextRect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", previewHeight)
    .attr("stroke", "black")
    .attr("fill", "#d3d3d3")
    .attr("opacity", 0.3)


  // ----- BRUSH TO ZOOM ----- //
  let brush = d3
    .brushX()
    .extent([
      [0, 0],
      [width, height],
    ])
    .on("end", brushed);

  var idleTimeout;
  function idled() {
    idleTimeout = null;
  }


  function brushed(event) {
    let s = event.selection;
    // console.log("SELECTION:",s);
    // console.log("events rect:",eventsRect);
    if (!s) {
      if (!idleTimeout) return (idleTimeout = setTimeout(idled, 350));
      x.domain([0, 0]);
    } else {
      let newX0 = xContext(x.invert(s[0])),
          newX1 = xContext(x.invert(s[1]));

      x.domain([x.invert(s[0]), x.invert(s[1])]);

      svg.select(".brush").call(brush.move, null);

      xAxisGroup.call(xAxis.scale(x));
      // svg.selectAll(".soloLayers").remove();
      // drawIndividualArea(currentData);

      if (individualView) {
        syncSoloDelays(selectedDelay);
      }

      svg.selectAll(".delayLayers").transition().duration(1000).attr("d", area);
      svg.selectAll(".soloLayers").transition().duration(1000).attr("d", individualArea);

      svg.selectAll(".contextRect").transition().duration(1000)
        .attr("x", newX0)
        .attr("width", newX1 - newX0);

      // https://stackoverflow.com/questions/47828945/shorten-months-ticks-on-x-axis
      xAxisGroup.selectAll(".tick").each(function(d) {
        if (this.textContent === d3.timeFormat("%B")(d)) {
          d3.select(this).select("text").text(d3.timeFormat("%b"))
        }
      })
    }
  }

  function resetZoom () {
    x.domain(d3.extent([new Date(2015,12), d3.max(sortedData, d => d.date)]));
    xAxisGroup.call(xAxis);
    svg.selectAll(".delayLayers").transition().duration(1000).attr("d", area);
    // svg.selectAll(".soloLayers").attr("d", individualArea);
    svg.selectAll(".soloLayers").transition().duration(1000).attr("d", individualArea);//.style("opacity", 0);
    svg.selectAll(".contextRect").transition().duration(1000)
      .attr("x", 0)
      .attr("width", width);
  }

  svg.on("dblclick", resetZoom);


  // ----- DRAW AREAS ----- //
  // set up clip area so visualization doesn't go past axes
  let clip = svg
    .append("defs")
    .append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height)//-margin.top)
    .attr("x", 0)
    .attr("y", 0);

  let clipped = svg.append("g").attr("clip-path", "url(#clip)");
  let eventsRect = svg.append("g")
    .attr("class","events")
    .attr("class", "brush");
  eventsRect.call(brush);

  const area = d3
    .area()
    .x((d) => x(d.data.date))
    .y0((d) => y(d[0]))
    .y1((d) => y(d[1]));
    
  const individualArea = d3
    .area()
    .x((d) => x(d.data.date))
    .y0((d) => y(0))
    .y1((d) => y(d[1]-d[0]));

  function drawStackedArea(layerData) {
    clipped
      .selectAll("layers")
      .data(layerData)
      .join("path")
      .attr("class", (d) => "delayLayers " + d.key)
      .attr("fill", (d) => color(d.key))
      .attr("d", area);
  }

  function drawIndividualArea(layerData) {
    clipped
      .selectAll("soloLayers")
      .data(layerData)
      .join("path")
      .attr("class", (d) => "soloLayers " + d.key)
      .attr("fill", (d) => color(d.key))
      .attr("d", individualArea)
      .style("opacity", 0);
  }

  drawStackedArea(currentData);
  drawIndividualArea(currentData);

  // ----- DRAW VERTICAL LINE AND TOOLTIPS TO SHOW VALUE ON MOUSEOVER ----- //
  let hoverLine = eventsRect.append("line")
    .attr("class", "x")
    .attr("y1", 0)
    .attr("y2", height)
    .style("stroke", "red")
    .style("stroke-dasharray", "3,3")
    .style("opacity", 0);

  let hoverTotalLabel = svg.append('g')
    .append('text')
      .attr("class", "hoverTotalLabel")

  function getTextBox(selection) {
    selection.each(function(d) {d.bbox = this.getBBox();})
  }

  let labelBackgroundWidth = 90;

  for (i = 0; i < delayTypes.length; i++) {
    svg.append('g')
      .append('circle')
      .attr('class', "hoverCircle " + delayTypes[i])
      .attr("fill", highlightColors[i])
      .attr('r', 4)
      .style('opacity', 0);

    svg.append('g')
      .append('text')
      .attr("text-anchor", "end")
      .attr('class', "hoverText " + delayTypes[i])
      .attr('x', width + labelBackgroundWidth + margin.left - 0.5*legendSize)
      .attr('dy', '.35em')
      .attr("y", function (d) {
        return 20 + (5-i)*(legendSize+5)
      })
      .style('font-size',15)
      .style('opacity', 0)

    svg.append('g')
      .append('circle')
      .attr('class', "hoverSoloCircle " + delayTypes[i])
      .attr("fill", highlightColors[i])
      .attr('r', 4)
      .style('opacity', 0);
  }

  // ----- ADD HOVER LINE ----- //

  let bisect = d3.bisector(d => d.date).right;

  function handleMouseMove (event, d, newData) {
    let x0 = x.invert(d3.pointer(event)[0]);
    let i = bisect(newData, x0);
    let d0 = newData[i];
    let d1 = newData[i+1];
    let datum = (x0 - d0.date > d1.date - x0) ? d1 : d0;
    let total_ct = datum.carrier_ct + datum.weather_ct + datum.nas_ct + datum.security_ct + datum.late_aircraft_ct;

    let datumValues = new Map();
    datumValues.set("late_aircraft_ct", datum.late_aircraft_ct);
    datumValues.set("security_ct", datum.security_ct);
    datumValues.set("nas_ct", datum.nas_ct);
    datumValues.set("weather_ct", datum.weather_ct);
    datumValues.set("carrier_ct", datum.carrier_ct);

    // source for stacked area tooltips: https://bl.ocks.org/fabiomainardi/3976176cb36e718a608f
    let datumDelays = new Map();
    y1 = datum.late_aircraft_ct + datum.security_ct + datum.nas_ct + datum.weather_ct + datum.carrier_ct;
    y2 = datum.security_ct + datum.nas_ct + datum.weather_ct + datum.carrier_ct;
    y3 = datum.nas_ct + datum.weather_ct + datum.carrier_ct;
    y4 = datum.weather_ct + datum.carrier_ct;
    y5 = datum.carrier_ct;
    
    datumDelays.set("late_aircraft_ct", y1);
    datumDelays.set("security_ct", y2);
    datumDelays.set("nas_ct", y3);
    datumDelays.set("weather_ct", y4);
    datumDelays.set("carrier_ct", y5);
  
    let currentTime = d3.timeFormat('%b %Y')(datum.date);

    svg.select(".x")
      .attr("transform",
        `translate(${x(datum.date)}, 0)`)
      .style("opacity",1)
      .raise();
      
    svg.select(".hoverTotalLabel")
      .attr("transform", function(d) {
        if (individualView) {
          return `translate(${x(datum.date)}, ${y(datumValues.get(selectedDelay))-15})`
        } else {
          return `translate(${x(datum.date)}, ${y(total_ct)-15})`
        }
      })
      .attr("dx", "0.5em")
      .text(currentTime)
      .style("opacity",1)
      .append("tspan")
        .attr("x",0)
        .attr("dx", "0.5em")
        .attr("dy","1.2em")
        .text(function(d) {
          if (individualView) {
            return datumValues.get(selectedDelay).toFixed(2) + " Delays"
          } else { return total_ct.toFixed(2) + " Delays"}
        })
        .style("opacity",1)
      
    svg.select(".hoverTotalLabel").call(getTextBox);

    svg.selectAll(".hoverLabelRect").remove();
    svg.select(".hoverTotalLabel").remove(); // remove text and add after drawing rectangle so text is on top

    // redraw background rectangle behind total delays label
    svg.append("g")
      .append("rect")
      .attr("class", "hoverLabelRect")
      .attr("x", function(d){return d.bbox.x})
      .attr("y", function(d){return d.bbox.y})
      .attr("transform", function(d) {
        if (individualView) {
          return `translate(${x(datum.date)}, ${y(datumValues.get(selectedDelay))-15})`
        } else {
          return `translate(${x(datum.date)}, ${y(total_ct)-15})`
        }
      })
      .attr("width", function(d){return d.bbox.width})
      .attr("height", function(d){return d.bbox.height})
      .style("fill", "#B2C8EE")
      .style("opacity", 1)
      .lower();

    // re-add label text on top of background rect
    // https://brettromero.com/d3-js-adding-a-colored-background-to-a-text-element/
    svg.append('g')
    .append('text')
      .attr("class", "hoverTotalLabel")
      .attr("transform", function(d) {
        if (individualView) {
          return `translate(${x(datum.date)}, ${y(datumValues.get(selectedDelay))-15})`
        } else {
          return `translate(${x(datum.date)}, ${y(total_ct)-15})`
        }
      })
      .attr("dx", "0.5em")
      .text(currentTime)
      .style("opacity",1)
      .append("tspan")
        .attr("x",0)
        .attr("dx", "0.5em")
        .attr("dy","1.2em")
        .text(function(d) {
          if (individualView) {
            return datumValues.get(selectedDelay).toFixed(2) + " Delays"
          } else { return total_ct.toFixed(2) + " Delays"}
        })
        .style("opacity",1)

    for (const delayType of delayTypes) {
      if (individualView) {
        svg.select(".hoverSoloCircle." + selectedDelay)
          .attr("transform",
            `translate(${x(datum.date)}, ${y(datumValues.get(selectedDelay))})`)
          .style("opacity",1)
      } else {
        svg.select(".hoverCircle." + delayType)
          .attr("transform",
            `translate(${x(datum.date)}, ${y(datumDelays.get(delayType))})`)
          .style("opacity",1)

        svg.select(".hoverText."+delayType)
          .style("opacity", 1)
          .text(datumValues.get(delayType).toFixed(2))
      }
    }
  }


  function handleMouseOut (event, d) {
    svg.select(".x").style("opacity", 0);
    svg.select(".hoverTotalLabel").style("opacity", 0);
    svg.selectAll(".hoverLabelRect").remove();
    for (const delayType of delayTypes) {
      svg.select(".hoverCircle." + delayType).style("opacity",0);
      svg.select(".hoverText." + delayType).style("opacity", 0);
      svg.select(".hoverSoloCircle." + delayType).style("opacity",0)
    }
  }

  eventsRect
    .on("mousemove", function(event, d) {
      handleMouseMove(event, d, sortedData);
    })
    .on("mouseout", handleMouseOut)



  // ----- ADD TITLE ----- //
  let chartTitle = svg
    .append("text")
    .attr("id", "timeTitle")
    .attr("x", width/2)
    .attr("y", -margin.top)
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .text((d) => "Delayed " + selectedCarrier + " Flights")


  // ----- FILTER BY AIRLINE ----- // 
  function updateChart(selectedCarrier, svg) {
    individualView = false;

    x.domain(d3.extent([new Date(2015,12), d3.max(sortedData, d => d.date)]));
    xAxisGroup.call(xAxis);

    let filteredData = sortedData.filter(
      (d) => d.carrier_name === selectedCarrier
    );
    currentData = filteredData;
    let filteredStack = stackGen(currentData);

    svg.selectAll(".delayLayers").remove();
    drawStackedArea(filteredStack);

    svg.selectAll(".soloLayers").remove();
    drawIndividualArea(filteredStack);
    
    // https://stackoverflow.com/questions/47828945/shorten-months-ticks-on-x-axis
    xAxisGroup.selectAll(".tick").each(function(d) {
      if (this.textContent === d3.timeFormat("%B")(d)) {
        d3.select(this).select("text").text(d3.timeFormat("%b"))
      }
    })

    svg.selectAll(".contextLayers").remove();
    drawContextArea(filteredStack);

    svg.select(".contextRect")//.transition().duration(1000)
      .attr("x", 0)
      .attr("width", width)
      .raise();

    // change data for hover line with tooltip
    eventsRect
      .on("mousemove", function(event, d) {
        handleMouseMove(event, d, filteredData);
      })
      .on("mouseout", handleMouseOut)
  }

  function updateTitle(selectedCarrier) {
    document.getElementById("timeTitle").innerHTML = "Delayed " + selectedCarrier + " Flights";
  }

  d3.select("#selectButton").on("change", function (d) {
    selectedCarrier = this.value;
    updateChart(selectedCarrier, svg);
    updateTitle(selectedCarrier);
  });


  // ----- HOVER ON LEGEND TO HIGHLIGHT DELAY AREA ----- //
  let selectedDelay = "";
  
  function highlight (event, d) {
    d3.selectAll(".soloLayers").style("opacity", 0);
    d3.selectAll(".delayLayers").style("opacity", 0.3); // lower opacity if not selected
    d3.select("path.delayLayers." + d)
      // .attr("fill", function(d) {return highlightColor(d.key)})
      .style("opacity", 1); // selected should have full opacity
    d3.select(".delayLegend." + d).style("fill", "#f2f2f2");
  };


  let noHighlight = function (event, d) {
    if (!individualView) {
      d3.selectAll("path.delayLayers")
        // .attr("fill", function(d) {return color(d.key)})
        .style("opacity", 1);
      d3.selectAll(".delayLegend").style("fill", "white");
    } else {
      d3.selectAll("path.delayLayers").style("opacity", 0);
      d3.select(".soloLayers."+selectedDelay).style("opacity", 1);
      d3.selectAll(".delayLegend").style("fill", "white");
      d3.select(".delayLegend."+selectedDelay).style("fill", legendColor(selectedDelay));
    }
  };


  function syncSoloDelays (selectedDelay) {
    d3.selectAll(".soloLayers").style("opacity", 0);
    d3.select(".soloLayers." + selectedDelay).style("opacity", 1);
  }


  function selectDelayType (event, d) {
    updateChart(selectedCarrier, svg);
    selectedDelay = d;
    individualView = true;
    syncSoloDelays(selectedDelay);
    d3.selectAll(".delayLegend").style("fill", "white");
    d3.select(".delayLegend."+selectedDelay).style("fill", legendColor(selectedDelay));
  }


  // ----- DEFINE RESET VIEW AND DRAW RESET BUTTON ----- //
  function resetView () { 
    x.domain(d3.extent([new Date(2015,12), d3.max(sortedData, d => d.date)]));
    xAxisGroup.call(xAxis);
    svg.selectAll(".delayLayers").transition().duration(1000).attr("d", area).style("opacity", 1);
    // svg.selectAll(".soloLayers").transition().duration(1000).attr("d", individualArea).style("opacity", 0);
    
    svg.selectAll(".soloLayers").transition().duration(250).style("opacity",0)
    svg.selectAll(".soloLayers").remove();
    drawIndividualArea(currentData);

    svg.selectAll(".contextRect").transition().duration(1000)
      .attr("x", 0)
      .attr("width", width);

    d3.selectAll(".delayLegend").style("fill", "white");
    
    individualView = false;
  }
  
  let resetButton = svg
    .selectAll("reset")
    .data(["Reset View"])
    .enter()
    .append("rect")
    .attr("class", "resetButton")
    .attr("x", width + margin.left + labelBackgroundWidth)
    .attr("y", 10 + 9*(legendSize+5) - legendSize/2)
    .attr("width", 4.25*legendSize)
    .attr("height", legendSize)
    .attr("rx", 5)
    .style("stroke", "#d3d3d3")
    .style("fill", "white")
    .on("mouseover", function(event, d) {d3.select(this).style("fill", "#f2f2f2");})
    .on("mouseleave", function(event, d) {d3.select(this).style("fill", "white");})
    .on("click", resetView)

  let resetLabel = svg
    .selectAll("resetLabel")
    .data(["Reset View"])
    .enter()
    .append("text")
    .attr("x", width + margin.left + labelBackgroundWidth + 0.3*legendSize)
    .attr("y", 10 + 9*(legendSize+5))
    .style("fill", "#a6a6a6")
    .text(d => d)
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")
    .on("mouseover", function(event, d) {d3.select(".resetButton").style("fill", "#f2f2f2");})
    .on("mouseleave", function(event, d) {d3.select(".resetButton").style("fill", "white");})
    .on("click", resetView);

  let hoverTextCaption = svg
    .selectAll("hoverTextCaption")
    .data(["# Delays*"])
    .enter()
    .append("text")
    .attr("x", width + margin.left + legendSize)
    .attr("y", 15)
    .style("fill", "black")
    .text(d => d)
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")

  let hoverTextNote = svg
    .selectAll("hoverTextNote")
    .data(["*per 10,000 flights"])
    .enter()
    .append("text")
    .attr("x", width + margin.left + legendSize)
    .attr("y", 10 + 7*(legendSize+5))
    .style("fill", "black")
    .text(d => d)
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")

  let legendCaption = svg
    .selectAll("legendCaption")
    .data(["Delay Types"])
    .enter()
    .append("text")
    .attr("x", width + margin.left + labelBackgroundWidth + 0.3*legendSize)
    .attr("y", 15)
    .style("fill", "black")
    .text(d => d)
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")
  

  // ----- DRAW LEGEND AND LABELS ----- //
  let legend = svg
    .selectAll("legend")
    .data(delayTypes)
    .enter()
    .append("rect")
    .attr("class", d => "delayLegend " + d)
    .attr("x", width + margin.left + labelBackgroundWidth)
    .attr("y", function (d, i) {
      return 10 + (5-i)*(legendSize + 5);
    })
    .attr("width", 4.25*legendSize)
    .attr("height", legendSize)
    .attr("rx", 5)
    .style("stroke", (d) => highlightColor(d))
    .style("fill", "white")
    .on("mouseover", highlight)
    .on("mouseleave", noHighlight)
    .on("click", selectDelayType);

  const labelMap = new Map();
  labelMap.set('carrier_ct', 'Carrier')
  labelMap.set('weather_ct', 'Weather');    
  labelMap.set('nas_ct', 'NAS')
  labelMap.set('security_ct', 'Security')
  labelMap.set('late_aircraft_ct', 'Late Aircraft')

  let labels = svg
    .selectAll("labels")
    .data(delayTypes)
    .enter()
    .append("text")
    .attr("x", width + margin.left + labelBackgroundWidth + 0.3*legendSize)
    .attr("y", function (d, i) {
      return 10 + (5-i) * (legendSize + 5) + legendSize / 2;
    })
    .style("fill", (d) => highlightColor(d))
    .text((d) => labelMap.get(d))
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")
    .on("mouseover", highlight)
    .on("mouseleave", noHighlight)
    .on("click", selectDelayType);
}