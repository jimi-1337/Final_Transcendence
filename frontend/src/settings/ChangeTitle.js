
import { Container} from "react-bootstrap";
import { useContext, useRef, useState } from "react";
import {userContext} from '../context/AuthProvider';
import axios from "axios";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();


export default function ChangeTitle() {
  const {user, setUser} = useContext(userContext)
  const title = useRef();
  const [er, setEr] = useState({
      error:false,
      message:""
  });
  const [su, setSu] = useState(
    {
      success:false,
      message:""
    }
  );

 async function ChangeMyTitle(e) {
    e.preventDefault();
    if (user.xp < 50)
      return setEr(
        {
            error:true,
            message:"You Don't Have Enough XP"
        }
      )
    if (!title.current || title.current.value.length <= 5) return setEr(
        {
            error:true,
            message:"Title Can't Be Shorter Than 5 Characters"
        }
    );
    try {
        const val = await axios.post(publicRuntimeConfig.BACKEND_URL + "/change_title", {
          data:{
            user:user.user,
            title:title.current.value
          }
        });
        if (!val || val.data.id <= 0)
        return setEr(
          {
              error:true,
              message:"An Error Occured Try Again Later"
          }
        )
        setSu({
          success:true,
          message:"You Title Has Changed Successfully"
        })
        setUser({
          ...user,
          xp:val.data.xp
        })     
    } catch (error) {
      console.log(error.message)
      return setEr(
        {
            error:true,
            message:"An Error Occured Try Again Later"
        }
      )
    }
  }
  return (
    <Container>
      <form className="ChangeName">
        {er.error ? (
          <div className="alert alert-danger" role="alert">
            {er.message}
          </div>
        ) : null}
        {su.success ? (
          <div className="alert alert-success" role="alert">
            {su.message}
          </div>
        ) : null}
        <div className="form-group">
          <label for="exampleInputEmail1"></label>
          <small id="emailHelp" className="form-text text-muted DisplayNameText">
            It will cost you 50XP to change your current title
          </small>
          <input
            type="text"
            className="form-control DisplayNameInput"
            placeholder="Enter You New Title"
            ref={title}
          />
        </div>
        <button onClick={ChangeMyTitle} type="submit" className="btn btn-primary">
          Change
        </button>
      </form>
    </Container>
  );
}
