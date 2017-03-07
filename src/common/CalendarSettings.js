import React from 'react';
import { Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';

export const CalendarSettings = (props) => {
  return (
    <Card>
    <CardText>
      <TextField floatingLabelText="Floating Label Text"/>
    </CardText>

    <CardActions>
      <FlatButton label="Action1" />
    </CardActions>
  </Card>
  );
}
