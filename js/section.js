
/**
 * scrollVis - encapsulates
 * all the code for the visualization
 * using reusable charts pattern:
 * http://bost.ocks.org/mike/chart/
 */
 var scrollVis = function () {
    // constants to define the size
    // and margins of the vis area.
    var width = 600;
    var height = 520;
    var margin = { top: 0, left: 20, bottom: 40, right: 10 };
  
    // Keep track of which visualization
    // we are on and which was the last
    // index activated. When user scrolls
    // quickly, we want to call all the
    // activate functions that they pass.
    var lastIndex = -1;
    var activeIndex = 0;
  
    // Sizing for the grid visualization
    var squareSize = 6;
    var squarePad = 2;
    var numPerRow = width / (squareSize + squarePad);
  
    // main svg used for visualization
    var svg = null;
  
    // d3 selection that will be used
    // for displaying visualizations
    var g = null;
    
    // When scrolling to a new section
    // the activation function for that
    // section is called.
    var activateFunctions = [];
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
        svg = d3.select(this).selectAll('svg').data([wordData]);
        var svgE = svg.enter().append('svg');
        // @v4 use merge to combine enter and existing selection
        svg = svg.merge(svgE);
  
        svg.attr('width', width + margin.left + margin.right);
        svg.attr('height', height + margin.top + margin.bottom);
  
        svg.append('g');
  
  
        // this group element will be used to contain all
        // other elements.
        g = svg.select('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
  
        // perform some preprocessing on raw data
        var wordData = getWords(rawData);
        // filter to just include filler words
        var fillerWords = getFillerWords(wordData);
  
        // get the counts of filler words for the
        // bar chart display
        var fillerCounts = groupByWord(fillerWords);
        // set the bar scale's domain
        var countMax = d3.max(fillerCounts, function (d) { return d.value;});
        xBarScale.domain([0, countMax]);
  
        // get aggregated histogram data
  
        var histData = getHistogram(fillerWords);
        // set histogram's domain
        var histMax = d3.max(histData, function (d) { return d.length; });
        yHistScale.domain([0, histMax]);
  
        setupVis(wordData, fillerCounts, histData);
  
        setupSections();
      });
    };
  
  
    /**
     * setupVis - creates initial elements for all
     * sections of the visualization.
     *
     * @param wordData - data object for each word.
     * @param fillerCounts - nested data that includes
     *  element for each filler word type.
     * @param histData - binned histogram data
     */
    var setupVis = function (wordData, fillerCounts, histData) {
      // axis
      g.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxisBar);
      g.select('.x.axis').style('opacity', 0);
  
      // Step 1: count openvis title
      // title openvis-title
      g.append('text')
        .attr('class', 'title openvis-title')
        .attr('x', width / 2)
        .attr('y', height / 3)
        .text('Let\'s explore airport data ');
  
      g.selectAll('.openvis-title')
        .attr('opacity', 0);
  
      // Step 2 count filler word count title
      // count-title
      g.append('text')
        .attr('class', 'title count-title highlight')
        .attr('x', width / 2)
        .attr('y', height / 3)
        .text('180 Filler words');
  
      g.selectAll('.count-title')
        .attr('opacity', 0);

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
      activateFunctions[1] = showFillerTitle;
      
      // updateFunctions are called while
      // in a particular section to update
      // the scroll progress in that section.
      // Most sections do not need to be updated
      // for all scrolling and so are set to
      // no-op functions.
      for (var i = 0; i < 9; i++) {
        updateFunctions[i] = function () {};
      }
    };
  
    /**
      ACTIVATE FUNCTIONS
     */
  
    // STEP 1
    function showTitle() {
      g.selectAll('.count-title')
        .transition()
        .duration(0)
        .attr('opacity', 0);
  
      g.selectAll('.openvis-title')
        .transition()
        .duration(600)
        .attr('opacity', 1.0);
    }
  
    // STEP 2
    function showFillerTitle() {
      g.selectAll('.openvis-title')
        .transition()
        .duration(0)
        .attr('opacity', 0);
  
    // make next step invisible 
    //   g.selectAll('.square')
    //     .transition()
    //     .duration(0)
    //     .attr('opacity', 0);
  
      g.selectAll('.count-title')
        .transition()
        .duration(600)
        .attr('opacity', 1.0);
    }
  
    /**
     * showAxis - helper function to
     * display particular xAxis
     *
     * @param axis - the axis to show
     *  (xAxisHist or xAxisBar)
     */
    function showAxis(axis) {
      g.select('.x.axis')
        .call(axis)
        .transition().duration(500)
        .style('opacity', 1);
    }
  
    /**
     * hideAxis - helper function
     * to hide the axis
     *
     */
    function hideAxis() {
      g.select('.x.axis')
        .transition().duration(500)
        .style('opacity', 0);
    }
  
    /**
     * UPDATE FUNCTIONS
     *
     * These will be called within a section
     * as the user scrolls through it.
     *
     * We use an immediate transition to
     * update visual elements based on
     * how far the user has scrolled
     *
     */
  
    /**
     * updateCough - increase/decrease
     * cough text and color
     *
     * @param progress - 0.0 - 1.0 -
     *  how far user has scrolled in section
     */
    function updateCough(progress) {
      g.selectAll('.cough')
        .transition()
        .duration(0)
        .attr('opacity', progress);
  
      g.selectAll('.hist')
        .transition('cough')
        .duration(0)
        .style('fill', function (d) {
          return (d.x0 >= 14) ? coughColorScale(progress) : '#008080';
        });
    }
  
    /**
     * DATA FUNCTIONS
     *
     * Used to coerce the data into the
     * formats we need to visualize
     *
     */
  
    /**
     * getWords - maps raw data to
     * array of data objects. There is
     * one data object for each word in the speach
     * data.
     *
     * This function converts some attributes into
     * numbers and adds attributes used in the visualization
     *
     * @param rawData - data read in from file
     */
    function getWords(rawData) {
      return rawData.map(function (d, i) {
        // is this word a filler word?
        d.filler = (d.filler === '1') ? true : false;
        // time in seconds word was spoken
        d.time = +d.time;
        // time in minutes word was spoken
        d.min = Math.floor(d.time / 60);
  
        // positioning for square visual
        // stored here to make it easier
        // to keep track of.
        d.col = i % numPerRow;
        d.x = d.col * (squareSize + squarePad);
        d.row = Math.floor(i / numPerRow);
        d.y = d.row * (squareSize + squarePad);
        return d;
      });
    }
  
    /**
     * getFillerWords - returns array of
     * only filler words
     *
     * @param data - word data from getWords
     */
    function getFillerWords(data) {
      return data.filter(function (d) {return d.filler; });
    }
  
    /**
     * activate -
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
    var plot = scrollVis();
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
  
  // load data and display
  d3.tsv('data/words.tsv', display);
  