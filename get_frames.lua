local lfs = require("lfs")

local function extractFrames(videoPath, outputDir, interval)
    if not lfs.attributes(outputDir) then
        lfs.mkdir(outputDir)
    end

    os.execute("ffmpeg -i " .. videoPath .. " -vf fps=1/" .. interval .. " " .. outputDir .. "/%04d.jpg")
end

local videoPath = 'rick.mp4'
local outputDir = 'rick'
local interval = 0.1

extractFrames(videoPath, outputDir, interval)