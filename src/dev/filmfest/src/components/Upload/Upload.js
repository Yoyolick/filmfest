import './Upload.css';
import '../../resources/Shared.css'
import basicxhr from "../../resources/xhr"
import React from 'react';
import ListContainer from '../ListContainer/ListContainer';
import { filexhr } from '../../resources/xhr';
import { useParams } from "react-router-dom"

export default function UploadWrapper(){
    return(<Upload/>)
}

class Upload extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            allprojects: null,
            projects: [],
            classdata:null,
            selectedFile:null,
            selectedProject:null,
            selectedClass:null,
            uploading:false,
        }
    }

    onFileChange = event => {
        // Update the state
        this.setState({ selectedFile: event.target.files[0] });
    };

    handleProjectSelect = (value) => {
        this.setState({selectedProject: value});
    }

    handleClassSelect = (value) => {
        this.setState({selectedClass: value});
        //this.setState({projects: this.state.allprojects});
        //var list = []
        //for (const item in this.state.allprojects){
        //    console.log(this.state.allprojects[item][2],value)
        //    if(this.state.allprojects[item][2] === value){
        //        list.push(this.state.allprojects[item])
        //        console.log('pushed')
        //    }
        //}
        //this.setState({projects:list})
        //alert(this.state.projects)
        //this.setState({projects: Object.keys(this.state.allprojects).filter(x => this.state.allprojects[x] === value[0])});
    }

    onUpload = () => {
        var data = {
            "userid":window.localStorage.getItem('gerdyid'),
            "userkey":window.localStorage.getItem('gerdykey'),
            "title":document.getElementById('title').value,
            "description":document.getElementById('description').value,
            "project":this.state.selectedProject,
            "class":this.state.selectedClass,
        }

        if(data['title'].trim().length !== 0){
            if(this.state.selectedFile != null){
                this.setState({uploading: true});
                filexhr(this.state.selectedFile,data,'postvideo').then((response) => {
                    if(response === 'unauthorized'){
                        alert('You are unauthorized for this action');
                    }
                    else{
                        window.location.href = "http://192.168.50.80:3000/watch/" + response;
                    }
                })
            }
            else{
                alert('You need to select a mp4 video to upload.')
            }

        }
        else{
            alert('You need to set a title.')
        }
    };

    componentDidMount(){
        basicxhr("videouploadpre",{"profileid":this.state.userid,"userid":window.localStorage.getItem('gerdyid'),"userkey":window.localStorage.getItem('gerdykey')}).then(
            (response) => {
                //alert(typeof JSON.parse(response))
                if(response === 'unauthorized'){
                    window.localStorage.clear();
                    window.location.href = "http://192.168.50.80:3000/login";
                }
                else{
                    //this.setState({ allprojects: JSON.parse(response)[0]});
                    this.setState({ projects: JSON.parse(response)[0]});
                    this.setState({ classdata: JSON.parse(response)[1]});
                }
            }
        );
    }

    render(){
        const priv = window.localStorage.getItem('gerdypriv');
        if(priv === 'admin' || priv === 'dev' || priv === 'verified'){
            if(this.state.profiledata !== null && this.state.profiledata !== 'notexist' && this.state.classdata !== null && this.state.uploading === false){
                return(
                    <div className="uploadTop">
                        <div className="uploadPanel level2">
                            <h1 className="uploadText">Upload:</h1>
                            <form className='uploadForm'>
                                <div className="videoUpload">
                                    <h3 className='uploadVideoText'>Upload Video:</h3>
                                    <input onChange={this.onFileChange} accept="video/mp4" type="file"/>
                                </div>
    
                                <textarea id="title" maxLength="70" placeholder='Video Title' className="level1" type="text"/>
                                <textarea id="description" maxLength="200" placeholder='Video Credits and Description' className="level1" type="text"/>
                                
                                <h3>Select Class:</h3>
                                <ListContainer type="radio" recieveSelections={this.handleClassSelect} content={this.state.classdata}/>

                                <h3>Select Project:</h3>
                                <ListContainer type="radio" recieveSelections={this.handleProjectSelect} content={this.state.projects}/>
    
                                <a onClick={this.onUpload} type="submit" className="level1 UploadBtn">
                                    <h3 className='uploadtxt'>Upload</h3>
                                </a>
                            </form>
                        </div>
                    </div>
                )
            }
            else if(this.state.uploading === true){
                return <p>Uploading...</p> //TODO UPDATE THIS TO UPLOADING ICON REALLL!!!
            }
            else{
                return <p>Loading...</p> //TODO UPDATE THIS LOADING ICON REALLL!!!
            }
        }
        else{
            window.localStorage.clear();
            window.location.href = "http://192.168.50.80:3000/login";
        }
    }
}