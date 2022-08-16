import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import ACTIONS from '../actions';
import { initSocket } from '../socket';
import Editor from './Editor';
import style from './Editor.module.css';
import logo from '../code-logo.png';

const Client = ({ data: { username, typing } }) => {
  function getInitials(name) {
    if (!name) return '';
    let rgx = new RegExp(/(\p{L}{1})\p{L}+/, 'gu');
    let initials = [...name.matchAll(rgx)] || [];
    initials = (
      (initials.shift()?.[1] || '') + (initials.pop()?.[1] || '')
    ).toUpperCase();

    return initials;
  }

  return (
    <div className={style.client} title={username}>
      <div className={style.client__avatar}>{getInitials(username)}</div>
      <p>
        {username}
        {typing && <span>typing...</span>}
      </p>
    </div>
  );
};

const EditorPage = () => {
  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const [clients, setClients] = useState([]);
  const [error, setError] = useState('');
  const [clientsShown, setClientsShown] = useState(false);

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on('connect_error', (err) => handleErrors(err));
      socketRef.current.on('connect_failed', (err) => handleErrors(err));

      function handleErrors(e) {
        console.log('Socket error', e);
        toast.error('Socket connection failed. Try again later.');
        navigate('/');
      }

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId: id,
        username: location.state?.username,
      });

      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== location.state.username) {
            toast.success(`${username} has joined`);
          }
          setClients(clients);
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
          });
        }
      );

      socketRef.current.on(ACTIONS.TYPING, ({ socketId }) => {
        setClients((prev) => {
          return prev.map((client) => ({
            ...client,
            typing: client.socketId === socketId ? true : false,
          }));
        });
      });

      socketRef.current.on(ACTIONS.STOP_TYPING, ({ socketId }) => {
        setClients((prev) => {
          return prev.map((client) => ({
            ...client,
            typing: client.socketId === socketId && false,
          }));
        });
      });

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} has left.`);
        setClients((prev) => {
          return prev.filter((client) => client.socketId !== socketId);
        });
      });
    };

    init();

    return () => {
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
      socketRef.current.off(ACTIONS.TYPING);
      socketRef.current.off(ACTIONS.STOP_TYPING);
      socketRef.current.disconnect();
    };
  }, []);

  async function copyNotebookId() {
    try {
      await navigator.clipboard.writeText(id);
      toast.success('Notebook Id copied to clipboard');
    } catch (error) {
      console.log('error', error);
      toast.error('Failed to copy notebook id.');
    }
  }

  const runCode = () => {
    try {
      console.clear();
      eval(codeRef.current);
      toast.success('Code compiled successfully');
      setError();
    } catch (error) {
      console.log('error', error);
      toast.error(error);
      setError(error);
    }
  };

  function endSession() {
    navigate('/');
  }

  if (!location.state) {
    return <Navigate to="/" />;
  }

  return (
    <div className={style.page}>
      <aside className={style.sidebar}>
        <div className={style.brand__name}>
          <img src={logo} alt="logo" />
          <p>
            <small>Javascript</small>
            <span>
              <em>Code</em>book
            </span>
          </p>
        </div>
        <div className={style.menu__header}>
          Connected
          <span role="button" onClick={() => setClientsShown(!clientsShown)}>
            {clientsShown ? 'Hide' : 'Show'}
          </span>
        </div>
        <div
          className={
            clientsShown ? style.client__list_expanded : style.client__list
          }
        >
          {clients.map((client) => (
            <Client key={client.socketId} data={client} />
          ))}
        </div>
        <div className={style.sessionMenu}>
          <button
            type="button"
            onClick={copyNotebookId}
            className={style.sessionMenu__item}
          >
            Copy Notebook Id
          </button>
          <button
            type="button"
            onClick={endSession}
            className={style.leave__btn}
          >
            Leave
          </button>
        </div>
      </aside>
      <main className={style.main}>
        <Editor
          socketRef={socketRef}
          roomId={id}
          onCodeChange={(code) => (codeRef.current = code)}
        />
        <div className={style['console_btns']}>
          <span className={error && style['status_err']}>
            {error?.name} <span>: {error?.message}</span>{' '}
          </span>
          <button onClick={runCode} className={style['run_btn']}>
            Run
          </button>
        </div>
      </main>
    </div>
  );
};

export default EditorPage;
