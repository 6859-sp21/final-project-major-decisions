function createTimeChart() {
  d3.csv("https://raw.githubusercontent.com/6859-sp21/final-project-major-decisions/main/data/airlines_time_agg.csv", function (d) {
    return {
      // year: +d.year,
      // month: +d.month,
      date: new Date(+d.year, +d.month),
      carrier: d.carrier,
      carrier_name: d.carrier_name,
      arr_flights: +d.arr_flights,
      // arr_del15: +d.arr_del15,
      carrier_ct: (+d.carrier_ct * 10000) / +d.arr_flights,
      weather_ct: (+d.weather_ct * 10000) / +d.arr_flights,
      nas_ct: (+d.nas_ct * 10000) / +d.arr_flights,
      security_ct: (+d.security_ct * 10000) / +d.arr_flights,
      late_aircraft_ct: (+d.late_aircraft_ct * 10000) / +d.arr_flights,
      // arr_cancelled: +d.arr_cancelled,
      // arr_diverted: +d.arr_diverted,
      // arr_delay: +d.arr_delay,
      // carrier_delay: +d.carrier_delay,
      // weather_delay: +d.weather_delay,
      // nas_delay: +d.nas_delay,
      // security_delay: +d.security_delay,
      // late_aircraft_delay: +d.late_aircraft_delay,
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
    .text(function (d) {
      return d;
    })
    .attr("value", function (d) {
      return d;
    });

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

  let color = d3.scaleOrdinal().domain(delayTypes).range(delayColors);
  let highlightColor = d3.scaleOrdinal().domain(delayTypes).range(highlightColors);



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
    if (!s) {
      if (!idleTimeout) return (idleTimeout = setTimeout(idled, 350));
      x.domain([0, 0]);
    } else {
      let newX0 = xContext(x.invert(s[0])),
          newX1 = xContext(x.invert(s[1]));

      x.domain([x.invert(s[0]), x.invert(s[1])]);
      console.log(x.domain())

      svg.select(".brush").call(brush.move, null);

      xAxisGroup.call(xAxis.scale(x));
      svg.selectAll(".delayLayers").transition().duration(1000).attr("d", area);
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

  svg.on("dblclick", function () {
    x.domain(d3.extent([new Date(2015,12), d3.max(sortedData, d => d.date)]));
    xAxisGroup.call(xAxis);
    svg.selectAll(".delayLayers").transition().duration(1000).attr("d", area);
    svg.selectAll(".contextRect").transition().duration(1000)
      .attr("x", 0)
      .attr("width", width);
  });


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

  let area = d3
    .area()
    .x((d) => x(d.data.date))
    .y0((d) => y(d[0]))
    .y1((d) => y(d[1]));

  function drawStackedArea(layerData) {
    clipped
      .selectAll("layers")
      .data(layerData)
      .join("path")
      .attr("class", (d) => "delayLayers " + d.key)
      .attr("fill", (d) => color(d.key))
      .attr("d", area);
  }

  drawStackedArea(stackedData);


  // ----- DRAW VERTICAL LINE AND TOOLTIPS TO SHOW VALUE ON MOUSEOVER ----- //
  let hoverLine = eventsRect.append("line")
    .attr("class", "hoverInfo")
    .attr("class", "x")
    .attr("y1", 0)
    .attr("y2", height)
    .style("stroke", "red")
    .style("stroke-dasharray", "3,3")
    .style("opacity", 0);

  let hoverTotalLabel = svg.append('g')
    .append('text')
      .attr("class", "hoverInfo")
      .attr("class", "hoverTotalLabel")

  function getTextBox(selection) {
    selection.each(function(d) {d.bbox = this.getBBox();})
  }

  let labelBackgroundWidth = 0;

  for (i = 0; i < delayTypes.length; i++) {
    svg.append('g')
      .append('circle')
      .attr('class', "hoverInfo")
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
      .attr("transform",
        `translate(${x(datum.date)}, ${y(total_ct)-15})`)
      .attr("dx", "0.5em")
      .text(currentTime)
      .style("opacity",1)
      .append("tspan")
        .attr("x",0)
        .attr("dx", "0.5em")
        .attr("dy","1.2em")
        .text(total_ct.toFixed(2) + " Total Delays")
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
      .attr("transform",
          `translate(${x(datum.date)}, ${y(total_ct)-15})`)
      .attr("width", function(d){return d.bbox.width})
      .attr("height", function(d){return d.bbox.height})
      .style("fill", "#B2C8EE")
      .style("opacity", 0.6)
      .lower();

    // re-add label text on top of background rect
    // https://brettromero.com/d3-js-adding-a-colored-background-to-a-text-element/
    svg.append('g')
    .append('text')
      .attr("class", "hoverInfo")
      .attr("class", "hoverTotalLabel")
      .attr("transform",
        `translate(${x(datum.date)}, ${y(total_ct)-15})`)
      .attr("dx", "0.5em")
      .text(currentTime)
      .style("opacity",1)
      .append("tspan")
        .attr("x",0)
        .attr("dx", "0.5em")
        .attr("dy","1.2em")
        .text(total_ct.toFixed(2) + " Total Delays")
        .style("opacity",1)

    for (const delayType of delayTypes) {
      svg.select(".hoverCircle." + delayType)
        .attr("transform",
          `translate(${x(datum.date)}, ${y(datumDelays.get(delayType))})`)
        .style("opacity",1)

      svg.select(".hoverText."+delayType)
        .style("opacity", 1)
        .text(datumValues.get(delayType).toFixed(2))
    }
  }


  function handleMouseOut (event, d) {
    svg.select(".x").style("opacity", 0);
    svg.select(".hoverTotalLabel").style("opacity", 0);
    svg.selectAll(".hoverLabelRect").remove();
    for (const delayType of delayTypes) {
      svg.select(".hoverCircle." + delayType).style("opacity",0)
      svg.select(".hoverText." + delayType).style("opacity", 0);
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
    let filteredData = sortedData.filter(
      (d) => d.carrier_name === selectedCarrier
    );
    let filteredStack = stackGen(filteredData);
    svg.selectAll(".delayLayers").remove();
    drawStackedArea(filteredStack);

    x.domain(d3.extent(data, (d) => d.date))//.nice();
    xAxisGroup.call(xAxis);
    
    // https://stackoverflow.com/questions/47828945/shorten-months-ticks-on-x-axis
    xAxisGroup.selectAll(".tick").each(function(d) {
      if (this.textContent === d3.timeFormat("%B")(d)) {
        d3.select(this).select("text").text(d3.timeFormat("%b"))
      }
    })

    svg.selectAll(".contextLayers").remove();
    drawContextArea(filteredStack);

    svg.select(".contextRect")
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
    .attr("width", 8.5*legendSize)
    .attr("height", legendSize)
    .attr("rx", 5)
    .style("stroke", (d) => highlightColor(d))
    .style("fill", "white")
    .on("mouseover", highlight)
    .on("mouseleave", noHighlight)
    .on("click", onClick);

  const labelMap = new Map();
  labelMap.set('carrier_ct', 'Carrier Delays')
  labelMap.set('weather_ct', 'Weather Delays');    
  labelMap.set('nas_ct', 'National Air System Delays')
  labelMap.set('security_ct', 'Security Delays')
  labelMap.set('late_aircraft_ct', 'Late Aircraft Delays')

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
    .on("click", onClick);
}

  // ----- HOVER ON LEGEND TO HIGHLIGHT DELAY AREA ----- //
  let highlight = function (event, d) {
    d3.selectAll(".delayLayers").style("opacity", 0.2); // lower opacity if not selected
    d3.select("path.delayLayers." + d).style("opacity", 1); // selected should have full opacity
    d3.select(".delayLegend." + d).style("fill", "#f2f2f2");
  };

  let noHighlight = function (event, d) {
    d3.selectAll("path.delayLayers").style("opacity", 1);
    d3.selectAll(".delayLegend").style("fill", "white");
  };

  let onClick = function (event, d) {
    console.log("in click!", d)
  }
