import React from 'react';
import { Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';

import * as d3 from "d3";
import * as d3Scale from "d3-scale";
import Moment from "moment";
import SunCalc from "suncalc";

const HEADER_HEIGHT = 300;
const CANVAS_WIDTH = 1200;
const X_MARGIN = 50;
const Y_MARGIN = 50;
const DAY_HEIGHT = 15;
const GRAPH_HEIGHT = HEADER_HEIGHT + (DAY_HEIGHT * 366) + (Y_MARGIN * 2);
const GRAPH_WIDTH = CANVAS_WIDTH - (X_MARGIN * 2);

const GRAPH_BACKGROUND = '#000';

const LOCALE = 'it';

const SUN_COLOR = 'crimson';
const SAT_COLOR = 'hotpink';
const WD_COLOR = 'white';

const styles = {
  container: {
    textAlign: 'center',
    padding: 20,
    'background-color': '#000'
  },
};

export class Calendar extends React.Component {

  constructor(props){
    super(props);
    let { year, lat, lon } = props;
    let days = [];
    let day = new Moment(year, 'YYYY');
    while(day.year() === year){
      let times = SunCalc.getTimes(day.clone().add(1, 'days').toDate(), lat, lon);
      days.push([day.clone(), times]);
      day = day.add(1, 'day');
    }
    this.state = { days }
  }

  componentDidMount(){
    const svg = d3.select(this.svg);
    svg
      .attr('width', GRAPH_WIDTH)
      .attr('height', GRAPH_HEIGHT)
      .style('background-color', GRAPH_BACKGROUND)
    let container = svg
      .append('g')
      .attr('transform', (d, i) => `translate(${X_MARGIN}, ${Y_MARGIN})`);

    let renderDay = this.getRenderDay();

    container
      .selectAll('g.day-container')
      .data(this.state.days)
      .enter()
      .append('g')
      .attr('class', 'day-container')
      .attr('transform', (d, i) => `translate(0, ${i*DAY_HEIGHT})`)
      .each(renderDay);
  }


  getRenderDay(){

    let { lat, lon } = this.props;

    return function (d, numDay){

      const weekDay = d[0].weekday();
      const sunriseHour = Moment(d[1].sunrise).hours();
      const domain = [d[0].toDate(), d[0].clone().add(1, 'days').toDate()];

      const hoursScale = d3Scale
        .scaleTime()
        .domain(domain)
        .range([100, 850]);



     let sunCalcTimes = [
       [-0.833, 'sunrise',       'sunset'      ],
       [  -0.3, 'sunriseEnd',    'sunsetStart' ],
       [    -6, 'dawn',          'dusk'        ],
       [   -12, 'nauticalDawn',  'nauticalDusk'],
       [   -18, 'nightEnd',      'night'       ],
       [     6, 'goldenHourEnd', 'goldenHour'  ],
     ];

      let radiansTimes = {
        'min' : -Math.PI/2,
        'max' : +Math.PI/2,
      };

      sunCalcTimes.map(i => {
        radiansTimes[i[1]] = i[0] / 180.0 * Math.PI;
      });

      const lightScale = d3Scale
        .scaleLinear()
        //.domain([-Math.PI/4,  -Math.PI/4, 0, Math.PI/16, Math.PI/4, Math.PI/2])
        //.range(["#000", "midnightblue", "orangered", "orangered", "yellow", "white"]);
        .domain([radiansTimes['min'], radiansTimes['nauticalDawn'], radiansTimes['dawn'], radiansTimes['sunriseEnd'],radiansTimes['sunrise'],radiansTimes['max']])
        .range(["black", "midnightblue", "hotpink","darkorange","yellow","white"]);

        const lightScaleBW = d3Scale
          .scaleLinear()
          .domain([radiansTimes['min'], 0, 0.01,radiansTimes['max']])
          .range(["black", "midnightblue" ,"white", "white"]);

      const element = d3.select(this);


      //coloring
      let timeCount = d[0].clone().add(0, 'days');
      let timeData = [];
      while (timeCount.isBefore(d[0].clone().add(24, 'hours'))){
        timeCount = timeCount.clone().add(5, 'minutes');
        timeData.push([timeCount, SunCalc.getPosition(/*Date*/ timeCount, /*Number*/ lat, /*Number*/ lon)]);

      }

      const ww = 750.0/timeData.length + 1;

      let timeDataEnter = element
      .selectAll('g.hour-container')
      .data(timeData)
      .enter();

      let gg = timeDataEnter
      .append('g')
      .attr('class', 'hour-container')
      .attr('transform', (d, i) => `translate(${hoursScale(d[0])}, 0)`);

      /*
      gg
      .append("rect")
      .attr("height", DAY_HEIGHT)
      .attr("width", 50)
      .attr("fill", d => { return d[1].altitude >= 0 ? "#fff" : "#000";});
      */

      gg
      .append("rect")
      .attr("height", DAY_HEIGHT)
      .attr("width", ww)
      .attr("fill", d => lightScaleBW(d[1].altitude));

      /*
      const altitudeScale = d3Scale.scaleLinear()
      .domain([-Math.PI, Math.PI]).range([0, DAY_HEIGHT]);

      var lineGenerator = d3.line();
      var pathData = timeData.map(x => [hoursScale(x[0]), altitudeScale(x[1].altitude)]);
      var pathString = lineGenerator(pathData);

      element
      .append('path')
  	   .attr('d', pathString)
       .attr('fill', "none")
       .attr('stroke', "#ddd");
       */

      /*
      element
      .append('rect')
      .attr('width', 50)
      .attr('height', DAY_HEIGHT)
      .style('fill', () => {  return weekDay == 0 ? SUN_COLOR : weekDay == 6 ? SAT_COLOR : WD_COLOR; });
      */


      //grid
      const gridScale = d3Scale
        .scaleLinear()
        .domain([0, 24])
        .range([100, 850]);
        //coloring
      let hour = 0;
      let hoursData = [];
      while (hour <= 24){
        hoursData.push(hour);
        hour += 1;
      }

      let ent = element
      .selectAll('line.hour-grid')
      .data(hoursData)
      .enter();

      ent
      .append('line')
      .attr('x1', d => gridScale(d))
      .attr('y1', 0)
      .attr('x2',  d => gridScale(d))
      .attr('y2', DAY_HEIGHT)
      .attr("stroke", "#ddd")
      .attr("opacity", 0.4);

      if(numDay % 14 ==0 ){
      ent
      .append('text')
      .attr('x', d => gridScale(d))
      .attr('y', 3)
      .attr("font-family", "Droid Sans")
      .attr("font-size", "10px")
      .attr("text-anchor", "middle")
      .style('fill', "#bbb")
      .text(d => d);
      }


      element
      .append('line')
      .attr('x1', 0)
      .attr('y1', DAY_HEIGHT / 2)
      .attr('x2',  GRAPH_WIDTH)
      .attr('y2',  DAY_HEIGHT / 2)
      .attr("stroke", "#ddd")
      .attr("opacity", 0.4);



      //times

      element
      .append('circle')
      .attr('cx', (d) => hoursScale(d[1].dawn))
      .attr('cy', DAY_HEIGHT/2)
      .attr('r', 3)
      .style('stroke', 'hotpink')
      .style('fill', 'transparent');

      element
      .append('circle')
      .attr('cx', (d) => hoursScale(d[1].sunrise))
      .attr('cy', DAY_HEIGHT/2)
      .attr('r', 3)
      .style('stroke', 'orange')
      .style('fill', 'transparent');

      element
      .append('circle')
      .attr('cx', (d) => hoursScale(d[1].sunset))
      .attr('cy', DAY_HEIGHT/2)
      .attr('r', 3)
      .style('stroke', 'darkorange')
      .style('fill', 'transparent');

      element
      .append('circle')
      .attr('cx', (d) => hoursScale(d[1].night))
      .attr('cy', DAY_HEIGHT/2)
      .attr('r', 3)
      .style('stroke', 'blue')
      .style('fill', 'transparent');

      element
      .append('circle')
      .attr('cx', (d) => hoursScale(d[1].dusk))
      .attr('cy', DAY_HEIGHT/2)
      .attr('r', 3)
      .style('stroke', 'MediumSlateBlue')
      .style('fill', 'transparent');


      element
      .append('text')
      .attr("x", 5)
      .attr("y", DAY_HEIGHT/2)
      .attr("font-family", "Droid Sans")
      .attr("font-size", "10px")
      .style('fill', () => {  return weekDay == 0 ? SUN_COLOR : weekDay == 6 ? SAT_COLOR : WD_COLOR; })
      .text((d, i) => {
        //let t = `${d[0].format('ddd D')} ${d[0].toDate()} `;
        let t = `${d[0].format('ddd D MMM')}`;
        return t;
      });


      ////times in numbers
      element
      .append('text')
      .attr('x', 870)
      .attr('y', DAY_HEIGHT / 2)
      .attr("font-family", "Droid Sans")
      .attr("font-size", "8px")
      .attr("text-anchor", "middle")
      .style('fill', '#ccc')
      .style('stroke', 'none')
      .text((d, i) =>  {
        return Moment(d[1].sunrise).format('HH:mm')
      } );

      element
      .append('text')
      .attr('x', 900)
      .attr('y', DAY_HEIGHT / 2)
      .attr("font-family", "Droid Sans")
      .attr("font-size", "8px")
      .attr("text-anchor", "middle")
      .style('fill', '#ccc')
      .style('stroke', 'none')
      .text((d, i) =>  {
        return Moment(d[1].sunset).format('HH:mm')
      } );



    }




  }




  render() {
    return (
      <Card>

      <CardTitle title={`${this.props.year}`} subtitle={`lat:${this.props.lat} lon:${this.props.lon}`}>
      </CardTitle>

      <div style={styles.container}>
      <svg ref={(svg) => { this.svg = svg }}>
      </svg>
      </div>



    </Card>

    );
  }
}
