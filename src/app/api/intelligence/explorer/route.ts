import { NextResponse } from "next/server";
import { UserRepo } from "@/app/lib/database/userrepo";
import { ChatRepo } from "@/app/lib/database/chatrepo";
import { AuthOptions } from "next-auth";
import { authOptions } from "@/app/lib/api/helper";
import { getServerSession } from "next-auth";
import { ChatHistory, IUser } from "@/app/lib/interface";

interface IChat {
    email: string;
    createAt: string;
    session: ChatHistory[];
}

interface IData {
    date: string;
    count: number;
}

export async function GET() {
    const session = await getServerSession(authOptions as AuthOptions);
    if (!session) {
        return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const users = await UserRepo.getFullUser();
    const chats = await ChatRepo.getFullHistory();
    const promptCount = chats.reduce((acc: number, chat: IChat) => acc + chat.session.reduce((acc: number, session: ChatHistory) => acc + session.chats.length, 0), 0);
    const conversationCount = chats.reduce((acc: number, chat: IChat) => acc + chat.session.length, 0);
    const pointsCount = users.reduce((acc: number, user: IUser) => acc + user.chatPoints, 0);
    const usersCount = users.length;
    
    // Collect all dates for users, prompts and conversations
    let usersDailyMap = new Map<string, number>();
    let promptsDailyMap = new Map<string, number>();
    let conversationsDailyMap = new Map<string, number>();
    
    // Track users by date
    for (const user of users) {
        if (user.createdAt) {
            const date = new Date(user.createdAt).toISOString().split('T')[0];
            usersDailyMap.set(date, (usersDailyMap.get(date) || 0) + 1);
        }
    }
    
    // Track conversations and prompts by date
    for (const chat of chats) {
        if (chat.session.length > 0) {
            for (const session of chat.session) {
                if (session.chats.length > 0) {
                    // Get date for conversation
                    const convDate = new Date(session.chats[0].timestamp).toISOString().split('T')[0];
                    conversationsDailyMap.set(convDate, (conversationsDailyMap.get(convDate) || 0) + 1);
                    
                    // Get dates for prompts
                    for (const message of session.chats) {
                        const promptDate = new Date(message.timestamp).toISOString().split('T')[0];
                        promptsDailyMap.set(promptDate, (promptsDailyMap.get(promptDate) || 0) + 1);
                    }
                }
            }
        }
    }
    
    // Get all unique dates and sort them
    const allDates = [...new Set([
        ...Array.from(usersDailyMap.keys()),
        ...Array.from(promptsDailyMap.keys()),
        ...Array.from(conversationsDailyMap.keys())
    ])].sort();
    
    // Generate cumulative data for each metric
    const usersCumulativeData: IData[] = [];
    const promptsCumulativeData: IData[] = [];
    const conversationsCumulativeData: IData[] = [];
    
    let usersCumulative = 0;
    let promptsCumulative = 0;
    let conversationsCumulative = 0;
    
    // Build cumulative data arrays for metrics
    for (const date of allDates) {
        // Add daily counts to cumulative totals
        usersCumulative += usersDailyMap.get(date) || 0;
        promptsCumulative += promptsDailyMap.get(date) || 0;
        conversationsCumulative += conversationsDailyMap.get(date) || 0;
        
        // Push cumulative data
        usersCumulativeData.push({ date, count: usersCumulative });
        promptsCumulativeData.push({ date, count: promptsCumulative });
        conversationsCumulativeData.push({ date, count: conversationsCumulative });
    }

    return NextResponse.json({
        usersCount,
        pointsCount,
        promptCount,
        conversationCount,
        dailyData: {
            users: usersCumulativeData,
            prompts: promptsCumulativeData,
            conversations: conversationsCumulativeData
        }
    });
}