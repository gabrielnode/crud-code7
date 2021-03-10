import React, { useState, useEffect, createRef } from 'react'
import '../styles/global.css'
import Autocomplete from '@material-ui/lab/Autocomplete'
import TextField from '@material-ui/core/TextField';
import axios from 'axios'
import Button from '@material-ui/core/Button';
import MaterialTable from "material-table";
import Modal from '@material-ui/core/Modal';
import { makeStyles } from '@material-ui/core/styles';
import CurrencyInput from 'react-currency-masked-input'
import moment from 'moment'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-notifications/lib/notifications.css';

const useStyles = makeStyles(theme => ({
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    paper: {
        position: 'absolute',
        width: 450,
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(2, 4, 3),
    },
}));
function rand() {
    return Math.round(Math.random() * 20) - 10;
}
function getModalStyle() {
    const top = 25
    const left = 25
    return {
        top: `${top}%`,
        left: `${left}%`,
        width: '55vw',
        height: '65vh',
        maxHeight: '60vh'
    };
}

const App = () => {
    const [debts, setDebts] = useState([])
    const [date, setDate] = useState('')
    const [price, setPrice] = useState('')
    const [motivation, setMotivation] = useState('')
    const [users, setUsers] = useState([])
    const [user, setUser] = useState('')
    const [inputValue, setInputValue] = useState('gdfgdfg')
    const [selectedName, setSelectedName] = useState('gdfgdfg')
    const [options, setOptions] = useState([])
    const userRef = createRef()
    const [value, setValue] = useState({ id: 0, name: "" })
    const [open, setOpen] = useState(false);
    const [keyUser, setKeyUser] = useState(null);

    const classes = useStyles();
    const [modalStyle] = useState(getModalStyle);
    useEffect(() => {
        async function fetchAll() {
            const users = await axios.get('https://jsonplaceholder.typicode.com/users')
            const debts = await axios.get('http://localhost:3001/api/v1/debts')
            const serializeData = debts.data.data.map(debt => {
                return {
                    ...debt,
                    date_debt: moment(new Date(debt.date_debt)).format('DD/MM/YYYY')
                }
            })

            setDebts(serializeData)
            setUsers(users.data)
        }
        fetchAll()
    }, [])
    const filterUsers = async (name) =>
        fetch(`https://jsonplaceholder.typicode.com/users?name_like=${name}`)
            .then(res => res.json())


    function mdata(date) {
        let v = date.target.value
        v = v.replace(/\D/g, "");
        v = v.replace(/(\d{2})(\d)/, "$1/$2");
        v = v.replace(/(\d{2})(\d)/, "$1/$2");

        v = v.replace(/(\d{2})(\d{2})$/, "$1$2");
        return v;
    }

    const handleOnChangeName = (option) => {
        const { id, name } = option
        userRef.current = { id, name }
        return option.name
    }
    const clearDatas = () => {
        setKeyUser(null)
        setMotivation('')
        setPrice('')
        setUser('')
        setDate('')
    }
    const handleSubmitDebts = async (event) => {
        event.preventDefault()
        const { current } = userRef

        const payload = {
            user_id: current.id,
            user_name: current.name,
            value: price,
            motivation_debt: motivation,
            date_debt: moment(date, 'DD/MM/YYYY').toISOString()
        }
        try {
            axios.post("http://localhost:3001/api/v1/debts", payload)
                .then(res => {
                    toast.success("Sucesso!");
                    debts.push(res.data.data.debts)
                })


        } catch (error) {
            console.log(error)
        }
    }

    const handleOpenRegister = (rowData) => {
        clearDatas()

        setOpen(true);
    };
    const handleOpenEdit = (rowData) => {
        const { motivation_debt, user_name, value, date_debt, user_id } = rowData
        const index = users.findIndex(user => user.id === user_id)
        setKeyUser(index)
        setMotivation(motivation_debt)
        setPrice(value)
        setUser(user_name)
        setDate(moment(date_debt).locale('').format('L'))
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };


    const notify = () => toast.success("Sucesso!");
    const handleDelete = async ({ id }) => {

        const debtsNew = [...debts]
        try {
            await axios.delete(`http://localhost:3001/api/v1/debts/${id}`)
            toast.success("Sucesso!");
            const index = debtsNew.findIndex(debt => debt.id === id)

            if (index > -1) {
                debtsNew.splice(index, 1);
            }

            setDebts(debtsNew)

        } catch (error) {
            console.log(error)
        }
    }
    console.log(debts)
    return (
        <div>
            <div className="card" >

                <Button
                    onClick={handleOpenRegister}
                    variant="contained"
                    color="primary"
                    style={{ width: '8vw', height: '4vh', fontSize: '0,1rem', margin: 10 }}
                >
                    Cadastrar
                            </Button>
                <MaterialTable
                    title="Action Overriding Preview"
                    options={{ grouping: true }}

                    columns={[
                        { title: '#', field: 'id' },
                        { title: 'Name', field: 'user_name' },
                        { title: 'Motivação', field: 'motivation_debt' },
                        { title: 'Valor', field: 'value' },
                        { title: 'Data', field: 'date_debt' },
                    ]}

                    data={debts}
                    actions={[
                        {
                            icon: 'save',
                            tooltip: 'Save User',
                            onClick: (event, rowData) => handleOpenEdit(rowData)
                        },
                        {
                            icon: 'delete',
                            tooltip: 'Delete User',
                            onClick: (event, rowData) => handleDelete(rowData),
                        }
                    ]}
                />
                <Modal
                    aria-labelledby="simple-modal-title"
                    aria-describedby="simple-modal-description"
                    open={open}
                    onClose={handleClose}
                >
                    <div style={modalStyle} className={classes.paper}>
                        <form className="form" onSubmit={handleSubmitDebts} >

                            <Autocomplete
                                style={{ width: '35vw', paddingBottom: 12 }}
                                freeSolo
                                id="free-solo-2-demo"
                                defaultValue={users[keyUser]}
                                disableClearable
                                getOptionLabel={(option) => handleOnChangeName(option)}
                                options={users}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Usuários"
                                        margin="normal"
                                        variant="outlined"
                                        InputProps={{ ...params.InputProps, type: 'search' }}
                                    />
                                )}
                            />

                            <TextField
                                id="outlined-basic"
                                label="Motivo" variant="outlined"
                                style={{ width: '35vw', paddingTop: 20 }}
                                value={motivation}
                                onChange={motivation => setMotivation(motivation.target.value)}
                                required
                            />
                            <CurrencyInput
                                placeholder="$0.00"
                                type="number"
                                value={price}
                                onChange={price => setPrice(price.target.value)}
                                required
                            />
                            <TextField
                                id="outlined-basic"
                                label="Data"
                                variant="outlined"
                                style={{ width: '35vw', paddingTop: 20 }}
                                value={date}
                                onChange={date => setDate(mdata(date))}
                                required
                            />

                            <div style={{ paddingTop: '1vw', paddingLeft: '20vw' }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    style={{ width: '15vw', height: '6vh', fontSize: '1em' }}
                                >
                                    Salvar
                                </Button>
                            </div>
                        </form>
                    </div>

                </Modal>

            </div>
        </div>
    )
}


export default App