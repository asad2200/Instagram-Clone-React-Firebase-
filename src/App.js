import {useEffect, useState} from "react";
import {auth, db} from "./firebase";
import Post from './Post';
import {Button, makeStyles, Modal, TextField} from "@material-ui/core";
import ImageUpload from "./ImageUpload";
import './App.css';

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

function App() {
  const [posts, setPosts] = useState([]);
  const [open, setOpen] = useState(false);
  const [openSignIn, setOpenSignIn] = useState(false);
  const classes = useStyles();
  const [modalStyle] = useState(getModalStyle);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        // user has logged in
        console.log(authUser);
        setUser(authUser);

        if (authUser.displayName) {

        } else {
          return authUser.updateProfile({
            displayName: username
          });
        }
      } else {
        // user has logged out
        setUser(null);
      }
    })
    return () => {
      unsubscribe();
    }
  }, [user, username])

  useEffect(() => {
    db.collection("posts").orderBy("timestamp","desc").onSnapshot(snapshot => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, post: doc.data() })))
    })
  }, []);

  const signUp = (event) => {
    event.preventDefault();
    auth.createUserWithEmailAndPassword(email, password)
      .then((authUser) => {
        return authUser.user.updateProfile({
          displayName: username
        })
      })
      .catch((error) => alert(error.message))

    setOpen(false)
  }

  const signIn = (event) => {
    event.preventDefault();
    auth.signInWithEmailAndPassword(email, password)
      .catch((error) => alert(error.message))

    setOpenSignIn(false)
  }

  return (
    <div className="App">
      <Modal
        open={open}
        onClose={() => { setOpen(false) }}
      >
        <div style={modalStyle} className={classes.paper}>
          <form className="app__signup" >
            <center>
              <img src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
                alt="Logo" />
            </center>
            <TextField
              placeholder="username" value={username}
              onChange={(e) => setUsername(e.target.value)}
              id="filled-basic" label="username" variant="filled"
            />
            <TextField
              placeholder="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="filled-basic" label="email" variant="filled"
            />
            <TextField
              type="password"
              placeholder="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              id="filled-basic" label="password" variant="filled"
            />
            <Button type="submit" onClick={signUp}>Sign Up</Button>
          </form>
        </div>
      </Modal>
      <Modal
        open={openSignIn}
        onClose={() => { setOpenSignIn(false) }}
      >
        <div style={modalStyle} className={classes.paper}>
          <form className="app__signup" >
            <center>
              <img src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
                alt="Logo" />
            </center>
            <TextField
              placeholder="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="filled-basic" label="email" variant="filled"
            />
            <TextField
              type="password"
              placeholder="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              id="filled-basic" label="password" variant="filled"
            />
            <Button type="submit" onClick={signIn}>LogIn</Button>
          </form>
        </div>
      </Modal>
      <div className="app__header">
        <img className="app__logo" src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
          alt="Logo" />
        {
          user ? (<Button onClick={() => auth.signOut()}>LogOut</Button>)
              : (
                  <div className="app__loginContainer">
                    <Button onClick={() => setOpen(true)}>Sign Up</Button>
                    <Button onClick={() => setOpenSignIn(true)}> LogIn </Button>
                  </div>
              )
        }
      </div>

      <div className="app__post">
        <div>
          {
            posts.map(({ id, post }) => (
                <Post key={id} postId={id} user={user} username={post.username} caption={post.caption} imgUrl={post.imgUrl} />
            ))
          }
        </div>
        <div></div>
      </div>

      {
        user?.displayName ? (
            <ImageUpload username={user.displayName}/>
        ):(
            <h3>Login to upload</h3>
        )
      }
    </div>
  );
}

export default App;
