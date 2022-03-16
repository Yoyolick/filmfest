import '../../resources/Shared.css'
import './ProfileBadge.css'
import {AiFillEye ,AiFillCode} from 'react-icons/ai';
import {MdMovieFilter, MdMovie, MdEdit} from 'react-icons/md';
import {BsFillCameraReelsFill} from 'react-icons/bs';

export default function ProfileBadge(props){
    if(props.type === "ma1"){
        const style = {
            backgroundColor : "#04db3a"
        }
        return(
            <div style={style} className="badge">
                <div className='icon'>
                    <MdMovie size={30}/>
                </div>
                <h3 className='badgetext'>Media Arts 1</h3>
            </div>
        )
    }
    else if(props.type === "ma2"){
        const style = {
            backgroundColor : "#7700cc"
        }
        return(
            <div style={style} className="badge">
                <div className='icon'>
                    <MdMovieFilter size={30}/>
                </div>
                <h3 className='badgetext'>Media Arts 2</h3>
            </div>
        )
    }
    else if(props.type === "views"){
        const style = {
            backgroundColor : "#db8b00"
        }
        return(
            <div style={style} className="badge">
                <div className='icon'>
                    <AiFillEye size={30}/>
                </div>
                <h3 className='badgetext'>{props.text}</h3>
            </div>
        )
    }
    else if(props.type === "dev"){
        return(
            <div className="badge dev">
                <div className='icon'>
                    <AiFillCode size={30}/>
                </div>
                <h3 className='badgetext'>Developer</h3>
            </div>
        )
    }
    else if(props.type === "ff"){
        const style = {
            backgroundColor : "#ff00cc"
        }
        return(
            <div style={style} className="badge">
                <div className='icon'>
                    <BsFillCameraReelsFill size={30}/>
                </div>
                <h3 className='badgetext'>Film Festival</h3>
            </div>
        )
    }
    else if(props.type === "edit"){
        return(
            <div onClick={()=>{
                window.location.href += "/edit";
            }
            } className="level1 editbtn">
                <div className='icon'>
                    <MdEdit size={30}/>
                </div>
                <h3 className='badgetext'>Edit Profile</h3>
            </div>
        )
    }
    else{
        return(<></>)
    }
    
}