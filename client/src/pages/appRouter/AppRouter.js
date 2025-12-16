import { Switch, Route, Redirect } from 'react-router-dom'
import { publicRoutes, adminRoutes } from './Routes';
// import { useContext } from 'react';
// import { Context } from '../../index';
import { MAIN_ROUTE } from './Const';

function AppRouter() {
    // const { user } = useContext(Context);
    return (
        <Switch>
            {/* {user.isAuth && adminRoutes.map(({ path, Component }) =>
                <Route key={path} path={path} component={Component} exact />
            )} */}
            {adminRoutes.map(({ path, Component }) =>
                <Route key={path} path={path} component={Component} exact />
            )}
            {publicRoutes.map(({ path, Component }) =>
                <Route key={path} path={path} component={Component} exact />
            )}
            <Redirect to={MAIN_ROUTE} />
            {/* <Redirect to={(window.location.pathname.split("/")[1] == "admin") ? window.location.pathname : '/'} /> */}
        </Switch>
    );
}

export default AppRouter;