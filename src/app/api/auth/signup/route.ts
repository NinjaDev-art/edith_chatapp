import { UserRepo } from "@/app/lib/database/userrepo";
import { NextRequest } from "next/server";
import { generateConfirmationToken } from "@/app/lib/api/token";
import { emailUserID } from "@/app/lib/config";
import emailjs from "@emailjs/nodejs";

export async function POST(request: NextRequest) {
    const { email, password, confirmPassword, name } = await request.json();

    if (password !== confirmPassword) {
        return Response.json({ error: "Passwords do not match" });
    }
    const user = await UserRepo.findByEmail(email);
    if (user && user.verify) {
        return Response.json({ error: "User already exists" });
    }

    try {
        if (!user) {
            const inviteCode = await UserRepo.createUniqueInviteCode();

            await UserRepo.create({
                email,
                password,
                name,
                inviteCode: inviteCode,
                numsOfUsedInviteCode: 0,
                loginType: "email",
                verify: false,
                role: "user",
                logins: 0,

            });
        }
        const token = await generateConfirmationToken(email, "email");
        const url = `${process.env.NEXTAUTH_URL}/verify?token=${token}`;
        const templateParams = {
            to_name: "dear",
            from_name: "ChatEdith",
            logo_url: process.env.LOGO_URL,
            recipient: email,
            message: url,
        };

        const result = await emailjs.send(
            process.env.EMAILJS_SERVICE_ID!,
            process.env.EMAILJS_TEMPLATE_ID!,
            templateParams,
            emailUserID
        );
        console.log(result);
        return Response.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Failed to sign up" });
    }
}