import React  from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import { CalendarSettings } from './common/CalendarSettings';
import { Calendar } from './common/Calendar';

export default class App extends React.Component {
  render() {
    return (

      <MuiThemeProvider>
      <div>
          <AppBar
            title="Sun calendar"
            showMenuIconButton={false}
          />
          {/*<CalendarSettings/>*/}
          <Calendar year={2017} lat={45.6833333} lon={9.71666670}/>
      </div>
      </MuiThemeProvider>


    );
  }
}
