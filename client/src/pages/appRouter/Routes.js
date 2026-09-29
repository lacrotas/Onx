import MainPage from "../userPages/MainPage";
import {
    MAIN_ROUTE, BUSKET_ROUTE, ITEM_ROUTE, AMIN_MAIN_ROUTE, SLIDER_REDUCT_ROUTE, ITEM_PREVIEW_ROUTE,
    SLIDE_ADD_ROUTE, KATEGORY_REDUCT_ROUTE, CURRENT_KATEGORY_REDUCT_ROUTE, LOGIN_ROUTE, CURRENT_POD_KATEGORY_REDUCT_ROUTE,
    FILTER_REDUCT_ROUTE, CURRENT_KATEGORY_FILTER_REDUCT_ROUTE, ITEM_REDUCT_ROUTE, NEW_ITEM_POST_ROUTE, NEW_ITEM_REDUCT_ROUTE,
    QWESTION_REDUCT_ROUTE, REVIEW_REDUCT_ROUTE, CURRENT_POD_KATEGORY_FILTER_REDUCT_ROUTE, ITEM_SEARCH_ROUTE, ITEM_MAIN_ROUTE,
    ITEM_KATEGOTY_ROUTE, MY_ORDERS_ROUTE, NOT_FOUND_ROUTE
} from './Const';
import BusketPage from "../userPages/busketPage/BusketPage";
// import ItemPage from "../userPages/itemPage/ItemPage";
import MainAdminPage from "../adminPages/MainAdminPage";
// import ItemFullPreview from "../userPages/itemPage/components/itemFullPreview/ItemFullPreview";
import ItemSearchPage from "../userPages/itemSearchPage/ItemSearchPage";
import ItemPageMainKategory from "../userPages/itemPageMainKategory/ItemPageMainKategory";
import ItemPageKategory from "../userPages/itemPageKategory/ItemPageKategory";
import CurrentItemPage from "../userPages/currentItemPage/CurrentItemPage";
import AuthPage from "../userPages/authPage/AuthPage";
import MyOrdersPage from "../userPages/myOrdersPage/MyOrdersPage";
import NotFoundPage from "../userPages/notFoundPage/NotFoundPage";

export const publicRoutes = [
    {
        path: NOT_FOUND_ROUTE,
        Component: NotFoundPage
    },
    {
        path: MAIN_ROUTE,
        Component: MainPage
    },
    {
        path: BUSKET_ROUTE + '/:userId?',
        Component: BusketPage
    },
    // {
    //     path: ITEM_ROUTE + '/:maincategory/:category?',
    //     Component: ItemPage
    // },
    {
        path: LOGIN_ROUTE,
        Component: AuthPage
    },
    {
        path: MY_ORDERS_ROUTE,
        Component: MyOrdersPage
    },
    {
        path: ITEM_SEARCH_ROUTE,
        Component: ItemSearchPage
    },
    {
        path: ITEM_PREVIEW_ROUTE + '/:itemAllias',
        Component: CurrentItemPage
    },
    {
        path: '/item/:itemAllias',
        Component: CurrentItemPage
    },
    {
        path: '/:allias',
        Component: ItemPageMainKategory
    },
    {
        path: '/:mainAllias/:allias/:itemAllias',
        Component: CurrentItemPage
    },
    {
        path: '/:mainAllias/:allias',
        Component: ItemPageKategory
    },
    {
        path: '/:mainAllias/:allias/:itemAllias?',
        Component: CurrentItemPage
    },

];

export const adminRoutes = [
    {
        path: AMIN_MAIN_ROUTE + '/:tab',
        Component: MainAdminPage,
    },
    {
        path: AMIN_MAIN_ROUTE,
        Component: MainAdminPage,
    },
]
