import { HttpCacheHeaderTaggerFromLoader, StoreFrontAwaretHttpCacheHeaderTagger } from '~/use-cases/http/cache';
import { HeadersFunction, json, LinksFunction, LoaderFunction, MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { getStoreFront } from '~/use-cases/storefront.server';
import { buildMetas } from '~/use-cases/MicrodataBuilder';
import { getContext } from '~/use-cases/http/utils';
import Product from '~/ui/pages/Product';
import dataFetcherForShapePage from '~/use-cases/dataFetcherForShapePage.server';
import videoStyles from '@crystallize/reactjs-components/assets/video/styles.css';
import { isAuthenticated } from '~/core/authentication.server';

export const headers: HeadersFunction = ({ loaderHeaders }) => {
    return HttpCacheHeaderTaggerFromLoader(loaderHeaders).headers;
};

export let meta: MetaFunction = ({ data }) => {
    return buildMetas(data.data);
};

export const links: LinksFunction = () => {
    return [{ rel: 'stylesheet', href: videoStyles }];
};

export const loader: LoaderFunction = async ({ request, params }) => {
    const requestContext = getContext(request);
    const path = `/shop/${params.folder}/${params.product}`;
    const { shared } = await getStoreFront(requestContext.host);
    let user = await isAuthenticated(request);

    const data = await dataFetcherForShapePage(
        'product',
        path,
        requestContext,
        params,
        user?.email?.split('@')[1] || null,
    );
    return json({ data }, StoreFrontAwaretHttpCacheHeaderTagger('15s', '1w', [path], shared.config.tenantIdentifier));
};

export default () => {
    const { data } = useLoaderData();
    return <Product data={data} />;
};
