import { useState } from 'react';
import Editor from './Editor';
import style from './Editor.module.css';

const Client = ({ data }) => {
  function getInitials(name) {
    let rgx = new RegExp(/(\p{L}{1})\p{L}+/, 'gu');

    let initials = [...name.matchAll(rgx)] || [];

    initials = (
      (initials.shift()?.[1] || '') + (initials.pop()?.[1] || '')
    ).toUpperCase();

    return initials;
  }

  return (
    <div className={style.client} title={data.username}>
      <div className={style.client__avatar}>{getInitials(data.username)}</div>
      <p>
        {data.username}
        {data.id === 5 && <span>typing...</span>}
      </p>
    </div>
  );
};

const EditorPage = () => {
  const [clients, setClients] = useState([
    {
      id: 1,
      socketId: 1,
      username: 'user name is very large 1',
    },
    {
      id: 2,
      socketId: 2,
      username: 'user 2',
    },
    {
      id: 3,
      socketId: 4,
      username: 'user 3',
    },
    {
      id: 4,
      socketId: 4,
      username: 'user 4',
    },
    {
      id: 5,
      socketId: 5,
      username: 'user 5',
    },
    {
      id: 6,
      socketId: 6,
      username: 'user 6',
    },
    {
      id: 7,
      socketId: 7,
      username: 'user 7',
    },
    {
      id: 8,
      socketId: 8,
      username: 'user 8',
    },
    {
      id: 9,
      socketId: 4,
      username: 'user 3',
    },
    {
      id: 10,
      socketId: 9,
      username: 'user 9',
    },
    {
      id: 11,
      socketId: 10,
      username: 'user 10',
    },
  ]);
  return (
    <div className={style.page}>
      <aside className={style.sidebar}>
        <div className={style.brand__name}></div>
        <div className={style.menu__header}>Connected</div>
        <div className={style.client__list}>
          {clients.map((client) => (
            <Client key={client.id} data={client} />
          ))}
        </div>
        <div className={style.sessionMenu}>
          <button type="button" className={style.sessionMenu__item}>
            Copy Notebook Id
          </button>
          <button type="button" className={style.leave__btn}>
            Leave
          </button>
        </div>
      </aside>
      <main className={style.main}>
        <Editor />
      </main>
    </div>
  );
};

export default EditorPage;
