import properties from "../../config/properties.js";
import axios from "axios";
const mockYouTubeMusicData = [
    {
        id: "kJQP7kiw5Fk",
        title: "Luis Fonsi - Despacito ft. Daddy Yankee",
        thumbnail: "https://ytimg.com",
        channelTitle: "LuisFonsiVEVO"
    },
    {
        id: "dQw4w9WgXcQ",
        title: "Rick Astley - Never Gonna Give You Up (Official Music Video)",
        thumbnail: "https://ytimg.com",
        channelTitle: "Rick Astley"
    },
    {
        id: "9bZkp7q19f0",
        title: "PSY - GANGNAM STYLE(강남스타일) M/V",
        thumbnail: "https://ytimg.com",
        channelTitle: "officialpsy"
    },
    {
        id: "OPf0YbXqDm0",
        title: "Mark Ronson - Uptown Funk (Official Video) ft. Bruno Mars",
        thumbnail: "https://ytimg.com",
        channelTitle: "MarkRonsonVEVO"
    }
];

// To use it in your code, you can temporarily return this:
// return mockYouTubeMusicData.slice(0, maxResults);

export const searchYouTubeMusic = async (
    {
        query,
        maxResults = 10
    }
) => {
    // const res = await axios.get(`${properties?.YOUTUBE_BASE_URL}/search`, {
    //     params: {
    //         key: properties?.YOUTUBE_API_KEY,
    //         q: `${query} official audio`,
    //         part: "snippet",
    //         type: "video",
    //         maxResults,
    //         videoCategoryId: "10", // Music category
    //     },
    // });

    // const items = res?.data?.items;


    // return items?.map((item) => ({
    //     id: item.id.videoId,
    //     title: item.snippet.title,
    //     thumbnail: item.snippet.thumbnails.high.url,
    //     channelTitle: item.snippet.channelTitle,
    // }));
    return mockYouTubeMusicData
};