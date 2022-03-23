import './ListContainer.css';
import '../../resources/Shared.css';
import React from 'react';

//export default function ListContainer(props){
//    return(
//        <TrueListContainer recieveSelections={props.recieveSelections} content={props.content} type={props.type}/>
//    )
//}

export default class ListContainer extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            content:props.content,
            type:props.type,
            selected:[],
        }
        this.recieveSelections = props.recieveSelections.bind(this);
    }

    handleCheck = (e) =>{
        if(this.state.type === 'checkbox'){
            var list = this.state.selected
            if(!list.includes(e[0])){
                list.push(e[0])
            }
            else{
                list.splice(list.indexOf(e[0]),1)
            }
            this.setState({selected: list});
            this.props.recieveSelections(this.state.selected);
        }
        else if(this.state.type === 'radio'){
            const fakelist = [e[0]];
            this.setState({selected: fakelist});
            this.props.recieveSelections(this.state.selected);
        }
    }

    render(){
        if(this.state.type === 'checkbox'){
            return(
                <div className="level1 ListContainerTop">
                    {
                        this.state.content.map((option) =>{
                            return(
                                <div key={option[0]} className='ListContainerOption level2'>
                                    <input onChange={() => {this.handleCheck(option)}} className='ListContainerCheckbox' type="checkbox"/>
                                    <p className='ListContainerOptionText'>{option[1]}</p>
                                </div>   
                            )
                        })
                    }
                </div>
            )
        }
        else if(this.state.type === 'radio'){
            return(
                <div className="level1 ListContainerTop">
                    {
                        this.state.content.map((option) =>{
                            return(
                                <div key={option[0]} className='ListContainerOption level2'>
                                    <input onChange={() => {this.handleCheck(option)}} className='ListContainerCheckbox' type="radio" name={this.state.content}/>
                                    <p className='ListContainerOptionText'>{option[1]}</p>
                                </div>   
                            )
                        })
                    }
                </div>
            )
        }
        else{
            return(
                <div className="level1 ListContainerTop">
                    {
                        this.state.content.map(function(option){
                            return(
                                <div key={option[0]} className='ListContainerOption level2'>
                                    <p className='ListContainerOptionText'>{option[1]}</p>
                                </div>   
                            )
                        })
                    }
                </div>
            ) 
        }
    }
}