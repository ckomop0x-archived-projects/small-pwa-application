import React from 'react';
import {BrowserRouter as Router, Link, Route} from 'react-router-dom';
import './App.css';
import Back from './back.png'
import GreyProfile from './grey_profile.png'
import logo from './logo.svg';

function urlB64ToUint8Array (base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

const Profile = () => {
    return (
        <div>
            <nav className="navbar navbar-light bg-light">
          <span className="navbar-brand mb-0 h1">
            <Link to="/">
              <img src={Back} alt="logo" style={{height: 30}}/>
            </Link>
            Profile
          </span>
            </nav>

            <div style={{textAlign: 'center'}}>
                <img
                    src={GreyProfile} alt="profile"
                    style={{height: 200, marginTop: 50}}
                />
                <p style={{color: '#888', fontSize: 20}}>username</p>
            </div>

        </div>
    )
}

class List extends React.PureComponent {
    state = {
        items: [],
        loading: true,
        todoItem: '',
        isOffline: !navigator.onLine
    }

    constructor (props) {
        super(props);

        this.setOfflineStatus = this.setOfflineStatus.bind(this);
        this.deleteItem = this.deleteItem.bind(this);
        this.addItem = this.addItem.bind(this);
        this.showPushMessage = this.showPushMessage.bind(this);
    }

    addItem (event) {
        const item = this.state.todoItem;
        event.preventDefault()

        fetch('http://localhost:4567/items.json', {
            method: 'POST',
            body: JSON.stringify({item}),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(items => {
                if (items.error) {
                    alert(items.error)
                } else {
                    this.setState({items})
                    this.showPushMessage({
                        title: 'Updated',
                        body: `New item ${item}`
                    })
                }
            });

        this.setState({todoItem: ''})
    }

    setOfflineStatus () {
        this.setState({
            isOffline: !navigator.onLine
        })
    }

    showPushMessage (notification = {title: 'Hello App', body: 'Hello body'}) {
        global.registration.showNotification(notification.title, {
            body: notification.body
        });
    }

    deleteItem (itemId) {
        fetch('http://localhost:4567/items.json', {
            method: 'DELETE',
            body: JSON.stringify({id: itemId}),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(items => {
                if (items.error) {
                    alert(items.error)
                } else {
                    this.setState({items})
                    this.showPushMessage({
                        title: 'Updated',
                        body: `Item deleted`
                    })
                }
            })
    }

    subscribe () {
        const key = 'BCC7yLeOa5XBs4UZp-OSDQIYfrnDu165f9-70WOmu5NaqjNX3UFyidPSGl4t6eGbqWM8iExplYmd3JOz7o_tauI';

        global.registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlB64ToUint8Array(key)
        }).then(sub => {
            console.log('Subscribed!')
        }).catch(err => {
            console.warn('Did not subscribe.')
        })
    }

    componentDidMount () {
        fetch('http://localhost:4567/items.json')
            .then(response => response.json())
            .then(items => {
                this.setState({items, loading: false})
            })

        window.addEventListener('online', this.setOfflineStatus)
        window.addEventListener('offline', this.setOfflineStatus)
    }

    componentWillUnmount () {
        window.removeEventListener('online', this.setOfflineStatus)
        window.removeEventListener('offline', this.setOfflineStatus)
    }

    render () {
        return (
            <div className="App">
                <nav className="navbar navbar-light bg-light">
                    <span className="navbar-brand mb-0 h1">
                        <img src={logo} className="App-logo" alt="logo"/>
                            Todo List
                    </span>
                    {
                        this.state.isOffline && (
                            <span className="badge badge-danger my-3">Offline</span>
                        )
                    }
                    <span>
                        <Link to="/profile">Profile</Link>
                    </span>
                </nav>

                <div className="px-3 py-2">

                    <form className="form-inline my-3" onSubmit={this.addItem}>
                        <div className="form-group mb-2 p-0 pr-3 col-8 col-sm-10">
                            <input
                                className="form-control col-12"
                                placeholder="What do you need to do?"
                                value={this.state.todoItem}
                                onChange={e => this.setState({
                                    todoItem: e.target.value
                                })}
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary mb-2 col-4 col-sm-2">
                            Add
                        </button>
                    </form>

                    {this.state.loading && <p>Loading...</p>}

                    {
                        !this.state.loading && this.state.items.length === 0 &&
                        <div className="alert alert-secondary">
                            No items - all done!
                        </div>
                    }

                    {
                        !this.state.loading && this.state.items &&
                        <table className="table table-striped">
                            <tbody>
                                {
                                    this.state.items.map((item, i) => {
                                        return (
                                            <tr key={item.id} className="row">
                                                <td className="col-1">{i + 1}</td>
                                                <td className="col-10">{item.item}</td>
                                                <td className="col-1">
                                                    <button
                                                        type="button"
                                                        className="close"
                                                        aria-label="Close"
                                                        onClick={() => this.deleteItem(item.id)}
                                                    >
                                                        <span aria-hidden="true">&times;</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </table>
                    }
                    <br/>
                    <button onClick={this.subscribe}>Subscribe for Notifications</button>
                </div>
            </div>
        );
    }
}

export default () =>
    <Router>
        <div>
            <Route path="/" exact component={List}/>
            <Route path="/profile" exact component={Profile}/>
        </div>
    </Router>
