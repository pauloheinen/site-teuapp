export async function onRequest(context) {
    const url = new URL(context.request.url);
    const path = url.pathname.replace('/sistema/adotavc', '') || '/';
    const workerUrl = 'https://adotavc.paulohenriqe226.workers.dev' + path + url.search;
    return fetch(workerUrl, context.request);
}