import { Switch, Route } from 'react-router-dom';
import { publicRoutes, adminRoutes } from './Routes';
import NotFoundPage from '../userPages/notFoundPage/NotFoundPage';

function AppRouter() {
    return (
        <Switch>
            {adminRoutes.map(({ path, Component }) =>
                <Route key={path} path={path} component={Component} exact />
            )}
            {publicRoutes.map(({ path, Component }) =>
                <Route key={path} path={path} component={Component} exact />
            )}
            <Route component={NotFoundPage} />
        </Switch>
    );
}

export default AppRouter;