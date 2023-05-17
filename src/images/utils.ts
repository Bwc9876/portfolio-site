const getGithubOpenGraph = (repoDouble: string) => {
    const hash = Math.random() * 1000;
    return `https://opengraph.githubassets.com/${hash}/${repoDouble}`;
};

const getProjectImageSrc = async (ghRepo: string, inSrc?: string) => {
    let src = inSrc;
    if (src && !src.startsWith("https://")) {
        src = (await import(`../images/${src}.png`)).default.src;
    }
    return src ?? getGithubOpenGraph(ghRepo);
};

export default getProjectImageSrc;
