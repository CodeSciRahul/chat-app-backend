import { searchYouTubeMusic } from "../vendor/youtubeMusic.vendor.js"
import { asyncHandler } from "../../util/asyncHandler.util.js"
import { ApiResponse } from "../../util/apiResponse.util.js"
const getMusicService = asyncHandler(async (req, res) => {
        const {searchQuery} = req.query
        const musicList = await searchYouTubeMusic({query: searchQuery})
        return ApiResponse(res, 200, "Music fetch successfully", musicList)
})


export {
    getMusicService
}