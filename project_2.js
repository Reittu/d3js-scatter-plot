const MARGIN = { top: 80, right: 20, bottom: 80, left: 70 };
const OUTER_WIDTH = 1000,
  OUTER_HEIGHT = 500,
  INNER_WIDTH = OUTER_WIDTH - MARGIN.left - MARGIN.right,
  INNER_HEIGHT = OUTER_HEIGHT - MARGIN.top - MARGIN.bottom;

const TOOLTIP = { width: 180, offset: 30 };
TOOLTIP.offsetLeft = -(TOOLTIP.width + TOOLTIP.offset);
TOOLTIP.threshold = OUTER_WIDTH - TOOLTIP.width - TOOLTIP.offset;
const getTooltipOffset = e =>
  e.offsetX > TOOLTIP.threshold ? TOOLTIP.offsetLeft : TOOLTIP.offset;

const xScale = d3.scaleLinear().range([0, INNER_WIDTH]);
const yScale = d3.scaleTime().range([0, INNER_HEIGHT]);
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

const timeFormat = d3.timeFormat('%M:%S'); // y-Axis
const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));
const yAxis = d3
  .axisLeft(yScale)
  .tickFormat(timeFormat)
  .tickSizeInner(-INNER_WIDTH)
  .tickSizeOuter(0);

const wrapper = d3.select('.d3-wrapper');

const tooltip = wrapper
  .append('div')
  .attr('class', 'tooltip')
  .attr('id', 'tooltip')
  .style('opacity', 0)
  .style('width', TOOLTIP.width + 'px');

const svg = wrapper
  .append('svg')
  .attr('width', OUTER_WIDTH)
  .attr('height', OUTER_HEIGHT)
  .append('g')
  .attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`);

d3.json(
  'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json'
)
  .then(data => {
    data.forEach(d => {
      d.Place = +d.Place; // Unary plus (parse float shorthand)
      const parsedTime = d.Time.split(':');
      d.Time = new Date(1970, 0, 1, 0, parsedTime[0], parsedTime[1]); // Needed in date format for scaling
    });

    xScale.domain([
      d3.min(data, d => d.Year) - 1,
      d3.max(data, d => d.Year) + 1
    ]);
    yScale.domain(d3.extent(data, d => d.Time));

    svg
      .append('g')
      .attr('id', 'x-axis')
      .attr('transform', 'translate(0,' + INNER_HEIGHT + ')')
      .call(xAxis)
      .append('text') // x-label
      .attr('x', INNER_WIDTH / 2)
      .attr('y', 50)
      .style('text-anchor', 'end')
      .style('font-size', 16)
      .text('Year');

    svg
      .append('g')
      .attr('id', 'y-axis')
      .call(yAxis);

    svg
      .append('text') // y-label
      .attr('transform', 'rotate(-90)')
      .attr('x', -200)
      .attr('y', -50)
      .style('font-size', 16)
      .text('Time in minutes');

    svg
      .selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('r', 7)
      .attr('cx', d => xScale(d.Year))
      .attr('cy', d => yScale(d.Time))
      .attr('data-xvalue', d => d.Year)
      .attr('data-yvalue', d => d.Time.toISOString())
      .style('fill', d => colorScale(d.Doping !== ''))
      .on('mouseover', d => {
        tooltip
          .attr('data-year', d.Year)
          .style('opacity', 0.9)
          .style('left', d3.event.offsetX + getTooltipOffset(d3.event) + 'px')
          .style('top', d3.event.offsetY - 32 + 'px')
          .html(
            `${d.Name}: ${d.Nationality}<br>Year: ${d.Year}, Time: ${timeFormat(
              d.Time
            )} ${d.Doping ? '<br><br>' + d.Doping : ''}`
          );
      })
      .on('mouseout', () => tooltip.style('opacity', 0));

    svg
      .append('text')
      .attr('id', 'title')
      .attr('x', INNER_WIDTH / 2)
      .attr('y', -MARGIN.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '32px')
      .text('Doping in Professional Bicycle Racing');

    svg
      .append('text')
      .attr('x', INNER_WIDTH / 2)
      .attr('y', -MARGIN.top / 2 + 25)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .text("35 Fastest times up Alpe d'Huez");

    const legend = svg
      .selectAll('.legend')
      .data(colorScale.domain())
      .enter()
      .append('g')
      .attr('id', 'legend')
      .attr(
        'transform',
        (d, i) => `translate(0, ${INNER_HEIGHT / 2 - i * 30})`
      );

    legend
      .append('rect')
      .attr('x', INNER_WIDTH - 19)
      .attr('width', 19)
      .attr('height', 19)
      .style('fill', colorScale);

    legend
      .append('text')
      .attr('x', INNER_WIDTH - 26)
      .attr('y', 15)
      .style('text-anchor', 'end')
      .text(d =>
        d ? 'Riders with doping allegations' : 'No doping allegations'
      );
  })
  .catch(err => console.log(err));
