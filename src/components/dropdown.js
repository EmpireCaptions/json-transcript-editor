import React, { Component } from "react";
// import Input from "@material-ui/core/Input";
import alertify from 'alertifyjs';
import {
  Dropdown, DropdownMenu, DropdownToggle,
  FormGroup,
  Label,
  Input
} from 'reactstrap';
// import Plyr from 'plyr';
// import InfiniteScroll from "react-infinite-scroll-component";
// import { CountdownCircleTimer } from "react-countdown-circle-timer";


export default class CustomDropdown extends Component {
    constructor(props){
        super(props)
        this.state = {
            isOpen: false,
            text: props.value,
            checked: false
        }
    }
    toggle = () => {
        this.setState({isOpen: !this.state.isOpen})
    }
    save = () => {
        this.props.onChange({ target: { value: this.state.text } }, this.state.checked)
        this.setState({isOpen: !this.state.isOpen})
    }
    render(){
        const { isOpen, text, checked } = this.state
        const { onChange, defaultValue, value } = this.props
        return <Dropdown isOpen={isOpen} toggle={this.toggle}>
        <DropdownToggle
          tag="span"
          data-toggle="dropdown"
          aria-expanded={isOpen}
        >
            
          <p className="speakerStyle">{value}</p>
        </DropdownToggle>
        <DropdownMenu>
        <FormGroup check>
            <Input type="checkbox" name="check" id="exampleCheck" checked={checked} onChange={e => this.setState({ checked: e.target.checked })} />
            <Label for="exampleCheck" check>Change All Speakers</Label>
        </FormGroup>
            <input
                className="speakerStyle"
                onChange={e => this.setState({ text: e.target.value })}
                defaultValue={defaultValue}
                value={text} 
            />
          <div onClick={this.save} className="btn btn-primary btn-sm">Save</div>
        </DropdownMenu>
      </Dropdown>
    }
}