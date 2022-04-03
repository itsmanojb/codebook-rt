import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import style from './Home.module.css';
import logo from '../code-logo.png';

const Home = () => {
  const [notebookId, setNotebookId] = useState('');
  const [notebookIdError, setNotebookIdError] = useState(false);
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState(false);

  const navigate = useNavigate();

  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuid();
    setNotebookId(id);
    toast.success('New notebook has been created');
  };

  const startSession = (e) => {
    e.preventDefault();

    setNotebookIdError(notebookId === '');
    setUsernameError(username === '');

    if (notebookId.trim() === '' || username.trim() === '') {
      let errMsg = '';
      if (notebookId.trim() === '' && username.trim() !== '') {
        errMsg = 'Please enter Notebook id.';
      } else if (notebookId.trim() !== '' && username.trim() === '') {
        errMsg = 'Please enter your username.';
      } else {
        errMsg = 'Enter notebook id and username.';
      }
      toast.error(errMsg);
      return;
    }

    navigate(`/editor/${notebookId}`, {
      state: {
        username,
      },
    });
  };

  return (
    <div className={style.page}>
      <div className={style.logo__wrapper}>
        <img src={logo} className={style.logo} alt="logo" />
      </div>
      <div className={style.card}>
        <div className={style.card__header}></div>
        <div className={style.card__body}>
          <form noValidate onSubmit={(e) => startSession(e)}>
            <div className={style.form__input}>
              <label htmlFor="notebookId">Notebook Id</label>
              <input
                type="text"
                id="notebookId"
                placeholder="Paste Invitation Id"
                value={notebookId}
                required
                className={notebookIdError ? style.input__invalid : ''}
                onChange={(e) => {
                  setNotebookId(e.target.value);
                  setNotebookIdError(
                    e.target.value.trim() !== '' ? false : true
                  );
                }}
              />
            </div>
            <div className={style.form__input}>
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                placeholder="Enter your display name"
                value={username}
                required
                className={usernameError ? style.input__invalid : ''}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setUsernameError(e.target.value.trim() !== '' ? false : true);
                }}
              />
            </div>
            <div className={style.form__input}>
              <button className={style.start__button} type="submit">
                Join
              </button>
            </div>
          </form>
        </div>
        <div className={style.card__footer}>
          <p>
            If you like to create a new notebook,{' '}
            <a
              href="/#"
              className={style.btn__newSession}
              title="Create new notebook"
              onClick={createNewRoom}
            >
              click here
            </a>{' '}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
