function delay(ms, message) {
    return new Promise((resolve) => {
        setTimeout(() => {
            if (message)
                console.log(message);

            resolve();
        }, ms);
    })
}
async function waitUntil(callback, ms, message) {
    let ret = null;

    while (true) {
        const ret = callback();
        if (ret)
            return ret;

        await delay(ms, message);
    }
}
async function hasSelector(selector, ms) {
    return await waitUntil(() => document.querySelector(selector), ms);
}
async function hasSelectorLast(selector, ms) {
    return await hasSelectorAt(selector, -1, ms);
}
async function hasSelectorAt(selector, index, ms) {
    let ret = null;
    const has = await waitUntil(() => document.querySelectorAll(selector).length, ms);
    if (has) {
        const list = document.querySelectorAll(selector);
        if (index === -1)
            index = list.length - 1;

        ret = list[index];
    }

    return ret;
}

async function hasElement(elem) {
    return await waitUntil(() => elem);
}

/*
--summary
Upload all videos step by step to reduce manual click.
--remark
This is 2021-11-07 version. Maybe Youtube changed to new code because of Shorts service which was not exists at that time.
*/
async function uploadAll() {
    const ms = 7000;

    let i = 0;
    while (true) {
        const selector = "ytcp-button.style-scope.ytcp-video-list-cell-actions.edit-draft-button > div";
        const edit = await hasSelectorLast(selector, ms);
        if (!edit){
            console.log("exit");
            break;
        }

        edit.click();


        const offRadio = await hasSelectorLast("#offRadio", ms);
        offRadio.click();

        const next1 = await hasSelector("#next-button", ms);
        next1.click();

        const next2 = await hasSelector("#next-button", ms);
        next2.click();

        const saveOr = await hasSelector("#radioLabel", ms);
        saveOr.click();

        const public = await hasSelectorAt("#radioLabel", 3, ms);
        public.click();

        const done = await hasSelector("#done-button");
        done.click();

        const close = await hasSelector(".footer #close-button");
        close.click();

        await delay(ms, ++i);
    }
}
uploadAll();
