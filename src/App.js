import React, { useRef, useState } from 'react';
import './App.css';
import Footer from './Footer/Footer'

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  // your config
  apiKey: "AIzaSyAX9LYeObKaQYf6E0jQPRgyZ7zqZJwacas",
  authDomain: "mit-group-chat.firebaseapp.com",
  databaseURL: "https://mit-group-chat-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mit-group-chat",
  storageBucket: "mit-group-chat.appspot.com",
  messagingSenderId: "763596717611",
  appId: "1:763596717611:web:442fbc9646031a37bef46e"
})

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();


function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>ACTIVE CHAT</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <p class='paragraph'>Please Login First To Use Chat Feature</p>
      <div class='g-sign-in-button' onClick={signInWithGoogle}>
        <div class='content-wrapper'>
          <div class='logo-wrapper'>
            <img src='https://developers.google.com/identity/images/g-logo.png'/>
          </div>
          <span class='text-container'>
            <span>Sign in with Google</span>
          </span>
        </div>
      </div>
      <Footer/>
    </>
  )

}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}


function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');


  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (<>
    <main>

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>

    </main>

    <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />

      <button type="submit" disabled={!formValue}>🕊️</button>

    </form>
  </>)
}


function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://cdn-icons-png.flaticon.com/512/3177/3177440.png'} referrerpolicy="no-referrer" />
      <p>{text}</p>
    </div>
  </>)
}


export default App;
