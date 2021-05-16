 var scrollVis = function (data) {
    // size of te 
    const width = 960;
    const height = 650;
    var margin = { top: 0, left: 20, bottom: 40, right: 10 };
  
    // Keep track of which visualization
    // we are on and which was the last
    // index activated. When user scrolls
    // quickly, we want to call all the
    // activate functions that they pass.
    var lastIndex = -1;
    var activeIndex = 0;
  
    // main svg used for visualization
    var svg = null;
  
    // d3 selection that will be used
    // for displaying visualizations
    let g = null;
    
    // When scrolling to a new section
    // the activation function for that
    // section is called.
    let activateFunctions = [];
    // If a section has an update function
    // then it is called while scrolling
    // through the section with the current
    // progress through the section.
    var updateFunctions = [];
  
    /**
     * chart
     *
     * @param selection - the current d3 selection(s)
     *  to draw the visualization in. For this
     *  example, we will be drawing it in #vis
     */
    var chart = function (selection) {
      selection.each(function (rawData) {
        // create svg and give it a width and height
        svg = d3.select(this).selectAll('svg').data(rawData);
  
        setupVis(data);
  
        setupSections();
      });
    };
  
  
    // initial elements for allsections of the visualization. Hide everything first.
    var setupVis = function (data) {
        const vis = d3.select("#vis")

        // step 1 Title image
        vis.append("svg").attr('class', 'bts-intro').attr('width', width).attr('height', height)
        .attr('opacity', 0)
        .append("svg:image")
        .attr('x', -9)
        .attr('y', -12)
        .attr('width', width).attr('height', height)
        .attr("xlink:href", "assets/bts.png");

        // step 2 raw data image
        vis.append("svg").attr('class', 'data-intro').attr('width', width).attr('height', height)
        .attr('opacity', 0)
        .append("svg:image")
        .attr('x', -9)
        .attr('y', -12)
        .attr('width', width).attr('height', height)
        .attr("xlink:href", "assets/raw_data.png");
    };
  
    /**
     * setupSections - each section is activated
     * by a separate function. Here we associate
     * these functions to the sections based on
     * the section's index.
     *
     */
    var setupSections = function () {
      // activateFunctions are called each
      // time the active section changes
      activateFunctions[0] = showTitle;
      activateFunctions[1] = showBTSIntro;
      activateFunctions[2] = showDataIntro;
      activateFunctions[3] = showProcess;
      activateFunctions[4] = showPart1Banner;
      activateFunctions[5] = showDynamicBarChart;
      activateFunctions[6] = showDynamicBarChartMin;
      activateFunctions[7]= showOverviewBarChart;
      activateFunctions[8] = showMapOne;
      activateFunctions[9] = showDonut;
      activateFunctions[10] = showMapTwo;
      activateFunctions[11] = showTimeChart;


      
      // updateFunctions are called while
      // in a particular section to update
      // the scroll progress in that section.
      // Most sections do not need to be updated
      // for all scrolling and so are set to
      // no-op functions.
      for (var i = 0; i < 9; i++) {
        updateFunctions[i] = function () {}; // insert appropriate update functions
      }
    };
  
    /**
      ACTIVATE FUNCTIONS
     */
    const transitionTime = 600;
    // step 1 Title banner
    function showTitle() {
      d3.select(".bts-intro")
      .transition()
      .duration(0)
      .attr('opacity', 0)
      .attr('display', 'none');

    }

    // STEP 2: BTS instro
    function showBTSIntro() {
      d3.select("#total_map").remove();
      d3.select("#total_tooltip").remove();

      d3.select(".bts-intro")
      .transition()
      .duration(transitionTime)
      .attr('opacity', 1)
      .attr('display', 'block');


      d3.select('.data-intro')
      .transition() // this need to be left in as a hack for fast scrolling
      .duration(0)
      .attr('opacity', 0)
      .attr('display', 'none');
    }

    // STEP 3: Data Intro
    function showDataIntro() {
      d3.selectAll('.dynamic-bar').remove();

      d3.select('.bts-intro')
      .transition() // this need to be left in as a hack for fast scrolling
      .duration(0)
      .attr('opacity', 0)
      .attr('display', 'none');

     
      d3.select(".data-intro")
      .transition()
      .duration(transitionTime)
      .attr('opacity', 1)
      .attr('display', 'block');

      // TODO: remove process's worK
    }

    // STEP 4: process
    function showProcess(){
      // TODO: introduce process' work
      d3.select('.data-intro')
      .transition() 
      .duration(0)
      .attr('opacity', 0)
      .attr('display', 'none');
    }

    // STEP 5: part 1 banner
    function showPart1Banner() {
      // TODO: remove process' work 

      d3.selectAll('.dynamic-bar').remove();
    }
  
    async function showDynamicBarChart() {
      d3.selectAll('.dynamic-bar').remove();

      // TODO: remove previous STUFF

      // d3.select(".three-step").remove();

      d3.selectAll('.dynamic-bar')
      .transition()
      .duration(transitionTime)
      .attr('opacity', 1)
      .attr('display', 'block');
      //createPercentBarGroup(data);
      createPercentBarGroup(data);
    }

    function showDynamicBarChartMin(){
      d3.selectAll('.overview-bar').remove();
      d3.selectAll('.dynamic-bar').remove();

      d3.select(".three-step").remove();
      //await createCarrierRankBarPercentDelayed(data);
      //createCarrierRankBarAveMin(data);
      //catch(e) {/* we don't plan to do additional promise chaining, swallow the error for now*/}

      d3.selectAll('.dynamic-bar')
      .transition()
      .duration(transitionTime)
      .attr('opacity', 1)
      .attr('display', 'block');
      createAveMinBarGroup(data);


      // d3.select('.three-step')
      // .transition()
      // .duration(0)
      // .attr('opacity', 0)
      // .attr('display', 'none');
    }

    function showOverviewBarChart(){
      d3.selectAll('.dynamic-bar').remove();
      d3.select(".three-step").remove();
      //await createCarrierRankBarPercentDelayed(data);
      //createCarrierRankBarAveMin(data);
      //catch(e) {/* we don't plan to do additional promise chaining, swallow the error for now*/}

      // d3.selectAll('.dynamic-bar')
      // .transition()
      // .duration(transitionTime)
      // .attr('opacity', 1)
      // .attr('display', 'block');
      overviewBar(data);


      d3.select('.three-step')
      .transition()
      .duration(0)
      .attr('opacity', 0)
      .attr('display', 'none');
    }

       // STEP 3
    function showMapOne() {
      d3.select("#donut-map").remove();
      d3.selectAll('.overview-bar').remove();
      generateMapTotal()

      d3.select('.overview-bar')
      .transition()
      .duration(0)
      .attr('opacity', 0)
      .attr('display', 'none');

      d3.select('.three-step')
      .attr('opacity', 1)
      .attr('display', 'block');

      d3.select('.donut-step')
      .transition()
      .duration(0)
      .attr('opacity', 0)
      .attr('display', 'none');
    }

    // STEP 3.5
    function showDonut() {

      d3.select("#total_map").remove();
      d3.select("#total_tooltip").remove();
      d3.select("#delay_map").remove();
      d3.select("#delay_tooltip").remove();

      generateDonut()

      d3.select('.three-step')
      .transition()
      .duration(0)
      .attr('opacity', 0);

      d3.select('.donut-step')
      .transition()
      .duration(transitionTime)
      .attr('opacity', 1);

      d3.select('.four-step')
      .transition()
      .duration(0)
      .attr('opacity', 0);
    }

    // STEP 4
    function showMapTwo() {
      generateMap('arr_del15')

      d3.select("#donut-map").remove();
      d3.select("#time_vis").remove();
      document.getElementById("selectButton").innerHTML = null;

      d3.select('.donut-step')
      .transition()
      .duration(0)
      .attr('opacity', 0);

      d3.select('.four-step')
      .transition()
      .duration(transitionTime)
      .attr('opacity', 1);

      d3.select('.five-step')
      .transition()
      .duration(0)
      .attr('opacity', 0);
    }

    // STEP 5 OR 6
    function showTimeChart() {
      console.log("Is show time chart called?");
      d3.select("#delay_map").remove();
      d3.select("#delay_tooltip").remove();
      d3.select("#total_map").remove();
      d3.select("#total_tooltip").remove();

      createTimeChart();

      d3.select('.five-step')
      .transition()
      .duration(transitionTime)
      .attr('opacity', 1)
      .attr('display', 'block');

      d3.select('.four-step')
      .transition()
      .duration(0)
      .attr('opacity', 0)
      .attr('display', 'none');
    }  
  
    /**
     * activate 
     *
     * @param index - index of the activated section
     */
    chart.activate = function (index) {
      activeIndex = index;
      var sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
      var scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
      scrolledSections.forEach(function (i) {
        activateFunctions[i]();
      });
      lastIndex = activeIndex;
    };
  
    /**
     * update
     *
     * @param index
     * @param progress
     */
    chart.update = function (index, progress) {
      updateFunctions[index](progress);
    };
  
    // return chart function
    return chart;
  };
  
  
  /**
   * display - called once data
   * has been loaded.
   * sets up the scroller and
   * displays the visualization.
   *
   * @param data - loaded tsv data
   */
  function display(data) {
    // create a new plot and
    // display it
    var plot = scrollVis(data);
    d3.select('#vis')
      .datum(data)
      .call(plot);
  
    // setup scroll functionality
    var scroll = scroller()
      .container(d3.select('#graphic'));
  
    // pass in .step selection as the steps
    scroll(d3.selectAll('.step'));
  
    // setup event handling
    scroll.on('active', function (index) {
      // highlight current step text
      d3.selectAll('.step')
        .style('opacity', function (d, i) { return i === index ? 1 : 0.1; });
  
      // activate current section
      plot.activate(index);
    });
  
    scroll.on('progress', function (index, progress) {
      plot.update(index, progress);
    });
  }
  
  // load data and display, the entrance point to the whole flow
  d3.csv('https://raw.githubusercontent.com/6859-sp21/final-project-major-decisions/main/data/airlines.csv').then((data)=>{display(data)});
