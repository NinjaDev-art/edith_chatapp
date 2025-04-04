import { AuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/api/helper";
import { NextRequest } from "next/server";
import { TweetContentRepo } from "@/app/lib/database/tweetContentRepo";
import { UserRepo } from "@/app/lib/database/userrepo";
import { ITweetContentItem } from "@/app/lib/interface";
import { TaskListRepo } from "@/app/lib/database/taskListRepo";

export async function GET() {
    const session = await getServerSession(authOptions as AuthOptions);
    if (!session) {
        return Response.json({ success: false, message: "Unauthorized" });
    }

    try {
        const tweetContent = await TweetContentRepo.findByEmail(session?.user?.email as string);
        const twitterUserCount = await UserRepo.getTwitterUserCount();
        const topBoardUsers = await UserRepo.getTopBoardUsers();
        const taskLists = await TaskListRepo.findAll();
        const sortedTaskLists = taskLists.sort((a, b) => {
            if (b.year !== a.year) return b.year - a.year;
            if (b.month !== a.month) return b.month - a.month;
            return b.week - a.week;
        });
        return Response.json({ success: true, tweetContent, twitterUserCount, topBoardUsers, taskLists: sortedTaskLists });
    } catch (error) {
        console.error(error);
        return Response.json({ success: false, message: "Failed to fetch tweet content" });
    }
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions as AuthOptions);
    if (!session) {
        return Response.json({ success: false, message: "Unauthorized" });
    }

    try {
        let { url } = await request.json();
        if (!isValidTwitterUrl(url)) {
            return Response.json({ success: false, message: "Invalid Twitter URL" });
        }
        const tweetId = url.split("/").pop();

        const originalTweetContent = await TweetContentRepo.findByEmail(session?.user?.email as string);
        
        // Check weekly submission limit
        // if (originalTweetContent?.content) {
        //     const now = new Date();
        //     const startOfWeek = new Date(now);
        //     startOfWeek.setDate(now.getDate() - now.getDay()); // Set to Sunday
        //     startOfWeek.setHours(0, 0, 0, 0);

        //     const tweetsThisWeek = originalTweetContent.content.filter((content: ITweetContentItem) => 
        //         new Date(content.postedAt) >= startOfWeek
        //     ).length;

        //     if (tweetsThisWeek >= 3) {
        //         return Response.json({ 
        //             success: false, 
        //             message: "Weekly limit reached. You can only submit 3 tweets per week." 
        //         });
        //     }
        // }

        // Check for duplicate content
        if (originalTweetContent?.content?.find((content: ITweetContentItem) => {
            const checkId = content.url.split("/").pop();
            return checkId == tweetId;
        })) {
            return Response.json({ success: false, message: "Content already exists" });
        }

        const tweetContent = await fetch(`https://api.socialdata.tools/twitter/thread/${tweetId}`, {
            headers: {
                "Authorization": `Bearer ${process.env.SOCIALDATA_API_KEY}`,
                "Content-Type": "application/json"
            }
        });

        const tweetContentData = (await tweetContent.json())?.tweets[0];
        console.log("tweetContentData", tweetContentData);
        if (originalTweetContent?.content?.find((content: ITweetContentItem) => {
            const checkId = content.url.split("/").pop();
            return checkId == tweetContentData.id;
        })) {
            return Response.json({ success: false, message: "Content already exists" });
        }

        url = `https://x.com/${tweetContentData.user.screen_name}/status/${tweetContentData.id}`;
        const twitterProfile = await UserRepo.findByEmail(session?.user?.email as string);

        if (tweetContentData.user.id != twitterProfile?.twitterId) {
            return Response.json({
                success: false,
                message: "Please submit a tweet from your own Twitter account. We cannot process tweets from other accounts."
            });
        }

        const newTweetContent = {
            title: tweetContentData.full_text,
            url: url,
            status: 1,
            score: 0,
            createdAt: new Date(tweetContentData.tweet_created_at),
            postedAt: new Date(Date.UTC(
                new Date().getUTCFullYear(),
                new Date().getUTCMonth(),
                new Date().getUTCDate(),
                new Date().getUTCHours(),
                new Date().getUTCMinutes(),
                new Date().getUTCSeconds()
            )),
            base: 0,
            performance: 0,
            quality: 0,
            bonus: 0
        }

        if (!originalTweetContent) {
            await TweetContentRepo.create({
                email: session?.user?.email as string,
                content: [newTweetContent]
            });
        } else {
            await TweetContentRepo.update(
                session?.user?.email as string,
                [
                    ...originalTweetContent.content,
                    newTweetContent
                ]
            );
        }
        return Response.json({ success: true, message: "New content added successfully" });
    } catch (error) {
        console.error(error);
        return Response.json({ success: false, message: "Failed to add new content" });
    }
}

const isValidTwitterUrl = (url: string): boolean => {
    try {
        const urlObj = new URL(url);
        // Check if domain is valid (twitter.com or x.com)
        if (!['twitter.com', 'x.com'].includes(urlObj.hostname)) {
            return false;
        }

        // Check if URL path matches pattern /username/status/tweetId
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        if (pathParts.length !== 3 || pathParts[1] !== 'status') {
            return false;
        }

        // Validate tweet ID is numeric
        const tweetId = pathParts[2];
        if (!/^\d+$/.test(tweetId)) {
            return false;
        }

        return true;
    } catch (error) {
        return false;
    }
};