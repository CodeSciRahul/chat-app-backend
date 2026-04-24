import properties from "../../config/properties.js";
import axios from "axios";
const mockYouTubeMusicData = [
    {
        "id": "1vrEljMfXYo",
        "title": "John Denver - Take Me Home, Country Roads (Official Audio)",
        "thumbnail": "https://i.ytimg.com/vi/1vrEljMfXYo/hqdefault.jpg",
        "channelTitle": "JohnDenverVEVO"
    },
    {
        "id": "bM9UGg1FINk",
        "title": "Mariah Carey - O Holy Night (Official Audio)",
        "thumbnail": "https://i.ytimg.com/vi/bM9UGg1FINk/hqdefault.jpg",
        "channelTitle": "MariahCareyVEVO"
    },
    {
        "id": "4W5ir4DOtoE",
        "title": "Eternxlkz - ENOUGH! (Official Audio)",
        "thumbnail": "https://i.ytimg.com/vi/4W5ir4DOtoE/hqdefault.jpg",
        "channelTitle": "Eternxlkz"
    },
    {
        "id": "qgaRVvAKoqQ",
        "title": "Pearl Jam - Black (Official Audio)",
        "thumbnail": "https://i.ytimg.com/vi/qgaRVvAKoqQ/hqdefault.jpg",
        "channelTitle": "PearljamVEVO"
    },
    {
        "id": "G23iLGhh9lo",
        "title": "Alice In Chains - Nutshell (Official Audio)",
        "thumbnail": "https://i.ytimg.com/vi/G23iLGhh9lo/hqdefault.jpg",
        "channelTitle": "AliceInChainsVEVO"
    },
    {
        "id": "-uH2Z9xYWn8",
        "title": "TU HI HAI ❤️ | Official Audio | New Hindi Love Song 2026 | MUSIC BY AKSHAY",
        "thumbnail": "https://i.ytimg.com/vi/-uH2Z9xYWn8/hqdefault.jpg",
        "channelTitle": "MusicByAkshay"
    },
    {
        "id": "fHI8X4OXluQ",
        "title": "The Weeknd - Blinding Lights (Official Audio)",
        "thumbnail": "https://i.ytimg.com/vi/fHI8X4OXluQ/hqdefault.jpg",
        "channelTitle": "TheWeekndVEVO"
    },
    {
        "id": "QhW3P7_jvWY",
        "title": "Earth, Wind &amp; Fire - That&#39;s the Way of the World (Official Audio)",
        "thumbnail": "https://i.ytimg.com/vi/QhW3P7_jvWY/hqdefault.jpg",
        "channelTitle": "EarthWindandFireVEVO"
    },
    {
        "id": "vGJTaP6anOU",
        "title": "Elvis Presley - Can&#39;t Help Falling In Love (Official Audio)",
        "thumbnail": "https://i.ytimg.com/vi/vGJTaP6anOU/hqdefault.jpg",
        "channelTitle": "ElvisPresleyVEVO"
    },
    {
        "id": "RNOTF-znQyw",
        "title": "John Denver - Annie&#39;s Song (Official Audio)",
        "thumbnail": "https://i.ytimg.com/vi/RNOTF-znQyw/hqdefault.jpg",
        "channelTitle": "JohnDenverVEVO"
    }
]

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
}