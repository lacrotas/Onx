import CustomButton from "../../../customUI/customButton/CustomButton";
import "./LoginPage.scss";
import { signIn } from "../../../http/userApi";
import { useState } from "react";
import { useHistory } from 'react-router-dom';

function LoginPage() {
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const history = useHistory();
    
    const auth = async () => {
        try {
            const response = await signIn(login, password);
            history.push('/admin');
            window.location.reload();
            console.log(login + "\n" + password);
        } catch (e) {
            alert("Неправильный логин или пароль");
        }
    }

    return (
        <div className="login_form">
            <p className="jura_medium_bold">Авторизация</p>
            <input className="login_form_input tiny_p" value={login} onChange={(e) => setLogin(e.target.value)} type="text" placeholder="Логин" />
            <input className="login_form_input tiny_p" value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Пароль" />
            <CustomButton dealOnClick={auth} text={"Войти"} />
        </div>
    )
}

export default LoginPage;